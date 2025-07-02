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
import com.infinity.courseservice.models.StudentQualification;
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
    private StudentQualificationRepository studentQualificationRepository;

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
    void findQualification() {
        Qualification qualification = new Qualification(new Course(), "Description", "CS");
        qualification.setId(1L);

        CourseDto courseDto = new CourseDto(1L, "COSC", "Intro to CS", "101");
        when(qualificationRepository.findById(1L)).thenReturn(Optional.of(qualification));
        when(courseService.findCourse(any())).thenReturn(courseDto);

        QualificationDto result = qualificationService.findQualification(1L);

        assertNotNull(result);
        assertEquals("Description", result.description());
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
    void instructorDeleteQualification_shouldDeleteAndReturnIds() {
        // Arrange
        String description = "Some Description";
        QualificationRequest request = mock(QualificationRequest.class);
        when(request.description()).thenReturn(description);

        Qualification q1 = new Qualification();
        q1.setId(10L);

        Qualification q2 = new Qualification();
        q2.setId(20L);

        List<Qualification> qualifications = List.of(q1, q2);

        when(qualificationRepository.findByDescription(description))
                .thenReturn(qualifications);

        StudentQualification sq1 = new StudentQualification();
        sq1.setQualification(q1);

        StudentQualification sq2 = new StudentQualification();
        sq2.setQualification(q2);

        List<StudentQualification> studentQualifications = List.of(sq1, sq2);

        when(studentQualificationRepository.findAllByQualifications(qualifications))
                .thenReturn(studentQualifications);

        // Act
        List<Long> result = qualificationService.instructorDeleteQualification(request);

        // Assert
        assertEquals(List.of(10L, 20L), result);

        verify(qualificationRepository).deleteAll(qualifications);
        verify(studentQualificationRepository).deleteAll(studentQualifications);
    }

    @Test
    void instructorDeleteQualification_shouldThrowNotFoundException_whenNoQualificationsFound() {
        // Arrange
        String description = "Missing Description";
        QualificationRequest request = mock(QualificationRequest.class);
        when(request.description()).thenReturn(description);

        when(qualificationRepository.findByDescription(description))
                .thenReturn(List.of());

        // Act + Assert
        NotFoundException ex = assertThrows(NotFoundException.class, () ->
            qualificationService.instructorDeleteQualification(request)
        );

        assertTrue(ex.getMessage().contains("No qualifications found with description: " + description));

        // Verify no deletes happen
        verify(qualificationRepository, never()).deleteAll(any());
        verify(studentQualificationRepository, never()).deleteAll(any());
    }

    @Test
    void instructorDeleteQualification_whenNotFound_shouldThrow() {
        when(qualificationRepository.findAllByDescription(List.of("desc"))).thenReturn(Collections.emptyList());

        assertThrows(NotFoundException.class, () ->
            qualificationService.instructorDeleteQualification(new QualificationRequest(null, null, null, "desc", null))
        );
    }

    @Test
    void studentUpdateQualifications_shouldUpdateAndReturnDtos() {
        Long studentId = 5L;
        List<Long> qualificationIds = List.of(100L, 200L);

        StudentQualiRequest request = mock(StudentQualiRequest.class);
        when(request.qualificationIds()).thenReturn(qualificationIds);

        Qualification qualification1 = new Qualification();
        qualification1.setId(100L);
        qualification1.setDescription("Qualification 1");

        Course course1 = new Course();
        course1.setId(10L);
        qualification1.setCourse(course1);

        Qualification qualification2 = new Qualification();
        qualification2.setId(200L);
        qualification2.setDescription("Qualification 2");

        Course course2 = new Course();
        course2.setId(20L);
        qualification2.setCourse(course2);

        when(qualificationRepository.findAllByIds(qualificationIds))
                .thenReturn(List.of(qualification1, qualification2));

        // Mock CourseDtos
        CourseDto courseDto1 = new CourseDto(10L, "COSC", "Intro", "101");
        CourseDto courseDto2 = new CourseDto(20L, "MATH", "Algebra", "201");

        when(courseService.findCourse(10L)).thenReturn(courseDto1);
        when(courseService.findCourse(20L)).thenReturn(courseDto2);

        StudentDto studentDto = new StudentDto(
            studentId,
            "John",
            "Doe",
            123456,
            "Computer Science",
            2020,
            4
        );
        when(studentClient.getStudentById(studentId)).thenReturn(studentDto);

        // Act
        List<QualificationDto> result = qualificationService.studentUpdateQualifications(request, studentId);

        // Assert
        assertEquals(2, result.size());
        assertEquals("Qualification 1", result.get(0).description());
        assertEquals("Qualification 2", result.get(1).description());

        // Verify deletes
        verify(studentQualificationRepository).deleteAllByStudentId(studentId);

        // Verify saves
        ArgumentCaptor<StudentQualification> captor = ArgumentCaptor.forClass(StudentQualification.class);
        verify(studentQualificationRepository, times(2)).save(captor.capture());
        List<StudentQualification> saved = captor.getAllValues();
        assertEquals(100L, saved.get(0).getQualification().getId());
        assertEquals(200L, saved.get(1).getQualification().getId());
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

        List<Qualification> result = qualificationService.findQualificationsByDeptCode("COSC");

        assertEquals(1, result.size());
    }
}
