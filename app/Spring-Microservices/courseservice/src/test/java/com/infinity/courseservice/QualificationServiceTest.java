package com.infinity.courseservice;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.dao.DataIntegrityViolationException;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.QualificationDto;
import com.infinity.courseservice.dtos.QualificationRequest;
import com.infinity.courseservice.dtos.UserDtos.StudentDto;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.enums.UserRole;
import com.infinity.courseservice.dtos.StudentQualiRequest;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Qualification;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.repositories.*;
import com.infinity.courseservice.services.CourseService;
import com.infinity.courseservice.services.QualificationService;

class QualificationServiceTest {

    @Mock
    private SectionRepository sectionRepository;

    @Mock
    private UserInterface studentClient;

    @Mock
    private QualificationRepository qualificationRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CourseService courseService;

    @InjectMocks
    private QualificationService qualificationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void findQualification_whenQualificationExistsAndHasStudent_shouldReturnDtoWithStudent() {
        Qualification qualification = new Qualification(new Course(), 1L, "Description", "CS");
        qualification.setId(1L);

        CourseDto courseDto = new CourseDto(1L, "COSC", "Intro to CS", "101");
        StudentDto studentDto = new StudentDto(2L, "Alice","Sun",10001,"BA",  2020, 3);
        when(qualificationRepository.findById(1L)).thenReturn(Optional.of(qualification));
        when(courseService.findCourse(any())).thenReturn(courseDto);
        when(studentClient.getStudentById(1L)).thenReturn(studentDto);

        QualificationDto result = qualificationService.findQualification(1L);

        assertNotNull(result);
        assertEquals("Description", result.description());
        assertEquals(studentDto, result.student());
    }

    @Test
    void findQualification_whenNotFound_shouldThrowNotFoundException() {
        when(qualificationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> qualificationService.findQualification(99L));
    }

    @Test
    void instructorAddQualification_shouldSaveQualificationAndReturnDto() {
        CourseDto courseDto = new CourseDto(1L, "COSC", "Intro to CS", "101");
        Course course = new Course("COSC", "Intro to CS", "101");
        QualificationRequest request = new QualificationRequest(1L, 1L, 1L, "Description", "COSC");

        when(courseService.findCourse(1L)).thenReturn(courseDto);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));

        QualificationDto dto = qualificationService.instructorAddQualification(request);

        assertNotNull(dto);
        assertEquals("Description", dto.description());
        verify(qualificationRepository).save(any(Qualification.class));
    }

    @Test
    void instructorAddQualification_whenDuplicate_shouldThrowBadRequestException() {
        CourseDto courseDto = new CourseDto(1L, "CS", "Intro to CS", "101");
        Course course = new Course("CS", "Intro to CS", "101");
        QualificationRequest request = new QualificationRequest(1L, 1L, 1L,"Description", "CS");

        when(courseService.findCourse(1L)).thenReturn(courseDto);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(qualificationRepository.save(any())).thenThrow(DataIntegrityViolationException.class);

        assertThrows(BadRequestException.class, () -> qualificationService.instructorAddQualification(request));
    }

    @Test
    void instructorDeleteQualification_shouldDeleteAndReturnMessage() {
        Qualification q = new Qualification();
        q.setId(1L);

        when(qualificationRepository.findAllByDescription("desc")).thenReturn(List.of(q));

        String result = qualificationService.instructorDeleteQualification(new QualificationRequest(null, null, null, "desc", null));

        assertEquals("Qualification deleted successfully", result);
        verify(qualificationRepository).deleteAll(anyList());
    }

    @Test
    void instructorDeleteQualification_whenNotFound_shouldThrow() {
        when(qualificationRepository.findAllByDescription("desc")).thenReturn(Collections.emptyList());

        assertThrows(NotFoundException.class, () ->
            qualificationService.instructorDeleteQualification(new QualificationRequest(null, null, null, "desc", null))
        );
    }

    @Test
    void studentUpdateQualifications_shouldUpdateAndReturnDtos() {
        StudentQualiRequest request = new StudentQualiRequest(List.of(1L));
        Qualification oldQualification = new Qualification(new Course("COSC", "Intro", "101"), null, "Description", "CS");
        oldQualification.setId(1L);

        when(qualificationRepository.findAllByIdAndStudentIdIsNull(List.of(1L)))
            .thenReturn(List.of(oldQualification));
        when(studentClient.getStudentById(2L))
            .thenReturn(new StudentDto(2L, "Alice","Sun",10001,"BA",  2020, 3));
        when(courseService.findCourse(any()))
            .thenReturn(new CourseDto(1L, "CS", "Intro", "101"));

        List<QualificationDto> dtos = qualificationService.studentUpdateQualifications(request, 2L);

        assertEquals(1, dtos.size());
        assertEquals("Description", dtos.get(0).description());
        verify(qualificationRepository).deleteAllByStudentId(2L);
        verify(qualificationRepository).save(any());
    }

    @Test
    void findQualificationsByDeptCode_shouldReturnList() {
        Course course = new Course();
        course.setId(1L);
        course.setDeptCode("COSC");
        course.setName("Intro to Programming");
        course.setCourseNum("101");
        Qualification q = new Qualification();
        q.setCourse(course);
        q.setDescription("Sample Qualification");
        q.setDeptCode("COSC");

        when(qualificationRepository.findAllByDeptCode("COSC")).thenReturn(List.of(q));

        List<QualificationDto> result = qualificationService.findQualificationsByDeptCode("COSC");

        assertEquals(1, result.size());
    }
}
