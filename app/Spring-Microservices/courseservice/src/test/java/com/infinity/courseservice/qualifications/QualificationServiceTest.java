package com.infinity.courseservice.qualifications;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.QualificationDtos.QualificationDto;
import com.infinity.courseservice.dtos.QualificationDtos.QualificationDtoWithId;
import com.infinity.courseservice.dtos.QualificationDtos.QualificationRequest;
import com.infinity.courseservice.dtos.QualificationDtos.QualificationWithSectionDto;
import com.infinity.courseservice.dtos.QualificationDtos.StudentQualiRequest;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.enums.UserRole;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Qualification;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.StudentQualification;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.QualificationRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.StudentQualificationRepository;
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
    void instructorAddQualification_returnsDtoWithId_onSuccess() {
        // Arrange
        long courseId = 42L;
        QualificationRequest req = new QualificationRequest(1L, courseId, 2L, "Food Safety", "HOSP");

        Course course = new Course();
        course.setId(courseId);
        course.setDeptCode("HOSP");

        // stub load
        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(courseService.findCourse(courseId))
                .thenReturn(new CourseDto(courseId, "HOSP", "Hospitality", "101"));

        // no duplicate
        when(qualificationRepository.existsByCourseAndDescriptionAndDeptCode(
                course, req.description(), req.deptCode()))
                .thenReturn(false);

        // simulate save
        Qualification saved = new Qualification(course, req.description(), req.deptCode());
        saved.setId(99L);
        when(qualificationRepository.saveAndFlush(any(Qualification.class))).thenReturn(saved);

        // Act
        QualificationDtoWithId dto = qualificationService.instructorAddQualification(req);

        // Assert
        assertEquals(99L, dto.id());
        assertEquals("Food Safety", dto.description());
        assertEquals("101", dto.course().courseNum(),
                "courseDto from service should match what CourseService returned");

        verify(qualificationRepository).saveAndFlush(any(Qualification.class));
    }

    @Test
    void instructorAddQualification_throwsBadRequest_whenDuplicateDetected() {
        // Arrange
        long courseId = 84L;
        QualificationRequest req = new QualificationRequest(1L, courseId, 2L, "Ethics", "PHIL");

        Course course = new Course();
        course.setId(courseId);
        course.setDeptCode("PHIL");

        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(courseService.findCourse(courseId))
                .thenReturn(new CourseDto(courseId, "PHIL", "Philosophy", "200"));

        // simulate that this combination already exists
        when(qualificationRepository.existsByCourseAndDescriptionAndDeptCode(
                course, req.description(), req.deptCode()))
                .thenReturn(true);

        // Act & Assert
        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> qualificationService.instructorAddQualification(req));
        assertTrue(ex.getMessage().contains("already exists"));

        // ensure we never call saveAndFlush when a duplicate is pre-detected
        verify(qualificationRepository, never()).saveAndFlush(any());
    }

    @Test
    void instructorDeleteQualification_shouldDeleteAndReturnIds() {
        // Arrange
        Long qualificationId = 1L;
        Qualification qualification = new Qualification();
        qualification.setId(qualificationId);

        StudentQualification studentQualification = new StudentQualification();
        studentQualification.setQualification(qualification);

        List<Qualification> qualifications = List.of(qualification);
        List<StudentQualification> studentQualifications = List.of(studentQualification);

        when(qualificationRepository.findAllByIds(List.of(qualificationId)))
                .thenReturn(qualifications);
        when(studentQualificationRepository.findAllByQualificationIn(qualifications))
                .thenReturn(studentQualifications);

        // Act
        List<Long> result = qualificationService.instructorDeleteQualification(qualificationId);

        // Assert
        assertEquals(List.of(qualificationId), result);

        verify(qualificationRepository).deleteAll(qualifications);
        verify(studentQualificationRepository).deleteAll(studentQualifications);
    }

    @Test
    void instructorDeleteQualification_shouldThrowNotFound_whenNoQualifications() {
        // Arrange
        Long qualificationId = 1L;

        when(qualificationRepository.findAllByIds(List.of(qualificationId)))
                .thenReturn(List.of());

        // Act & Assert
        NotFoundException ex = assertThrows(
                NotFoundException.class,
                () -> qualificationService.instructorDeleteQualification(qualificationId));

        assertEquals("No qualifications found with id: " + qualificationId, ex.getMessage());

        verify(qualificationRepository, never()).deleteAll(any());
        verify(studentQualificationRepository, never()).deleteAll(any());
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

        UserDto studentDto = new UserDto(2L,"Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT), 12345678, "COSC", 2025, 3, null,
                null, null);
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
        q.setId(100L);
        q.setDescription("Qualification 1");
        q.setDeptCode("COSC");
        q.setCourse(course); // <--- This was missing

        when(qualificationRepository.findAllByDeptCode("COSC")).thenReturn(List.of(q));

        List<QualificationDtoWithId> result = qualificationService.findQualificationsByDeptCode("COSC");

        assertEquals(1, result.size());
    }

    @Test
    void findQualificationsByInstructorId_returnsDtosForEachSectionQualificationPair() {
        long instructorId = 77L;

        Course course = new Course();
        course.setId(1L);
        course.setDeptCode("COSC");
        Section s1 = new Section();
        s1.setId(10L);
        s1.setYear(2024);
        s1.setSemester("W1");
        s1.setSection("001");
        s1.setType(SectionType.LECTURE);
        s1.setCourse(course);
        Section s2 = new Section();
        s1.setId(11L);
        s1.setYear(2025);
        s1.setSemester("W1");
        s1.setSection("001");
        s1.setType(SectionType.LECTURE);
        s1.setCourse(course);

        Qualification q1 = new Qualification(course, "Java", "COSC");
        Qualification q2 = new Qualification(course, "C++", "COSC");
        q1.setId(100L);
        q2.setId(101L);
        when(sectionRepository.findAllByInstructorId(instructorId))
                .thenReturn(List.of(s1, s2));

        when(qualificationRepository.findAllByCourse(course))
                .thenReturn(List.of(q1, q2));

        List<QualificationWithSectionDto> dtos = qualificationService.findQualificationsByInstructorId(instructorId);

        assertEquals(2, dtos.size());

        // collect the IDs and verify they contain what we expect
        List<Long> ids = dtos.stream()
                .map(QualificationWithSectionDto::qualificationId)
                .collect(Collectors.toList());

        assertTrue(ids.contains(100L));
        assertTrue(ids.contains(101L));
    }
}
