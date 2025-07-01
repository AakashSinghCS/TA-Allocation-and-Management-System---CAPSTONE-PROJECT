package com.infinity.courseservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.ActiveEnrollmentDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.CompletedCourseDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.EnrollmentRequest;
import com.infinity.courseservice.dtos.EnrollmentDtos.StudentEnrollmentOverviewDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoNoCourse;
import com.infinity.courseservice.dtos.UserDtos.StudentDto;
import com.infinity.courseservice.enums.EnrollmentStatus;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.StudentCourse;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.StudentCourseRepository;
import com.infinity.courseservice.services.EnrollmentService;
import com.infinity.courseservice.utility.EnrollmentMapper;

@ExtendWith(MockitoExtension.class)
public class EnrollmentServiceTest {

    @Mock
    private StudentCourseRepository studentCourseRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private SectionRepository sectionRepository;
    @Mock
    private UserInterface userInterface;
    @Mock
    private EnrollmentMapper enrollmentMapper;

    @InjectMocks
    private EnrollmentService enrollmentService;

    @Test
    void enrollStudent_enrolledWithoutSection_throwsBadRequest() {
        Course course = new Course("COSC", "Intro", "111");
        course.setId(1L);

        EnrollmentRequest request = new EnrollmentRequest(100L, 1L, null, EnrollmentStatus.ENROLLED, null, null);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> enrollmentService.enrollStudent(request));
        assertEquals("Can't enroll in a course with no section id", ex.getMessage());
    }

    @Test
    void enrollStudent_sectionNotBelongingToCourse_throwsBadRequest() {
        Course course = new Course("COSC", "Intro", "111");
        course.setId(1L);
        Course otherCourse = new Course("MATH", "Calc", "101");
        otherCourse.setId(2L);
        Section section = new Section();
        section.setId(3L);
        section.setCourse(otherCourse);

        EnrollmentRequest request = new EnrollmentRequest(100L, 1L, 3L, EnrollmentStatus.ENROLLED, null, null);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(sectionRepository.findById(3L)).thenReturn(Optional.of(section));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> enrollmentService.enrollStudent(request));
        assertTrue(ex.getMessage().contains("Section does not belong"));
    }

    @Test
    void enrollStudent_completedWithSection_throwsBadRequest() {
        Course course = new Course("COSC", "Intro", "111");
        course.setId(1L);
        Section section = new Section();
        section.setId(2L);
        section.setCourse(course);

        EnrollmentRequest request = new EnrollmentRequest(100L, 1L, 2L, EnrollmentStatus.COMPLETED, 90, 85);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(sectionRepository.findById(2L)).thenReturn(Optional.of(section));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> enrollmentService.enrollStudent(request));
        assertTrue(ex.getMessage().contains("Cannot mark as COMPLETED when a section is still active"));
    }

    @Test
    void enrollStudent_duplicateEnrollment_throwsBadRequest() {
        Course course = new Course("COSC", "Intro", "111");
        course.setId(1L);
        EnrollmentRequest request = new EnrollmentRequest(100L, 1L, null, EnrollmentStatus.COMPLETED, 90, 85);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentCourseRepository.existsByStudentIdAndCourseId(100L, 1L)).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> enrollmentService.enrollStudent(request));
        assertTrue(ex.getMessage().contains("already enrolled"));
    }

    @Test
    void enrollStudent_successfulCompletedEnrollment() {
        Course course = new Course("COSC", "Intro", "111");
        course.setId(1L);
        EnrollmentRequest request = new EnrollmentRequest(100L, 1L, null, EnrollmentStatus.COMPLETED, 90, 85);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(studentCourseRepository.existsByStudentIdAndCourseId(100L, 1L)).thenReturn(false);

        String result = enrollmentService.enrollStudent(request);
        assertEquals("Student enrolled", result);
        verify(studentCourseRepository).save(any(StudentCourse.class));
    }

    @Test
    void deleteEnrollment_notFound_throwsException() {
        when(studentCourseRepository.existsById(999L)).thenReturn(false);
        assertThrows(NotFoundException.class, () -> enrollmentService.deleteEnrollment(999L));
    }

    @Test
    void getCompletedCourses_returnsDtos() {
        StudentCourse course = mock(StudentCourse.class);
        CompletedCourseDto dto = new CompletedCourseDto(
                new CourseDto(1L, "COSC", "Intro", "111"), 95, 90);

        when(studentCourseRepository.findAllByStudentIdAndStatus(1L, EnrollmentStatus.COMPLETED))
                .thenReturn(List.of(course));
        when(enrollmentMapper.toCompletedCourseDto(course)).thenReturn(dto);

        List<CompletedCourseDto> result = enrollmentService.getCompletedCourses(1L);
        assertEquals(1, result.size());
        assertEquals(dto, result.get(0));
    }

    @Test
    void getActiveCourses_returnsDtos() {
        StudentCourse course = mock(StudentCourse.class);
        ActiveEnrollmentDto dto = new ActiveEnrollmentDto(
                new CourseDto(1L, "COSC", "Intro", "111"),
                new SectionDtoNoCourse(1L, 2025, "W1", "001", SectionType.LECTURE), 90);

        when(studentCourseRepository.findAllByStudentIdAndStatus(1L, EnrollmentStatus.ENROLLED))
                .thenReturn(List.of(course));
        when(enrollmentMapper.toActiveEnrollmentDto(course)).thenReturn(dto);

        List<ActiveEnrollmentDto> result = enrollmentService.getActiveEnrollmentList(1L);
        assertEquals(1, result.size());
        assertEquals(dto, result.get(0));
    }

    @Test
    void getFullEnrollmentOverview_aggregatesBothTypes() {
        StudentDto studentDto = new StudentDto(1L, "John", "Smith", 12345678, "COSC", 2021, 4);
        StudentCourse enrolled = mock(StudentCourse.class);
        StudentCourse completed = mock(StudentCourse.class);
        StudentEnrollmentOverviewDto overview = new StudentEnrollmentOverviewDto(
                studentDto, List.of(), List.of());

        when(userInterface.getStudentById(1L)).thenReturn(studentDto);
        when(studentCourseRepository.findAllByStudentIdAndStatus(1L, EnrollmentStatus.ENROLLED))
                .thenReturn(List.of(enrolled));
        when(studentCourseRepository.findAllByStudentIdAndStatus(1L, EnrollmentStatus.COMPLETED))
                .thenReturn(List.of(completed));
        when(enrollmentMapper.toOverviewDto(studentDto, List.of(enrolled), List.of(completed)))
                .thenReturn(overview);

        StudentEnrollmentOverviewDto result = enrollmentService.getFullEnrollmentOverview(1L);
        assertEquals(overview, result);
    }
}
