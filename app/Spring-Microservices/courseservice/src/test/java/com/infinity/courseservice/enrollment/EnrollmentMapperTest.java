package com.infinity.courseservice.enrollment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.ActiveEnrollmentDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.CompletedCourseDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.StudentEnrollmentOverviewDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoNoCourse;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.enums.EnrollmentStatus;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.enums.UserRole;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.models.StudentCourse;
import com.infinity.courseservice.utility.EnrollmentMapper;

@ExtendWith(MockitoExtension.class)
public class EnrollmentMapperTest {

    private EnrollmentMapper mapper = new EnrollmentMapper();

    @Test
    void testToCourseDto() {
        Course course = new Course("COSC", "Intro", "110");
        course.setId(1L);
        StudentCourse studentCourse = new StudentCourse();
        studentCourse.setCourse(course);

        CourseDto result = mapper.toCourseDto(studentCourse);

        assertEquals("COSC", result.deptCode());
        assertEquals("Intro", result.name());
        assertEquals("110", result.courseNum());
        assertEquals(1L, result.id());
    }

    @Test
    void testToSectionDtoNoCourse_validSection() {
        Semester semester = new Semester(2024, "W1", null, null);
        Section section = new Section();
        section.setId(10L);
        section.setSemester(semester);
        section.setSection("002");
        section.setType(SectionType.LECTURE);

        SectionDtoNoCourse dto = mapper.toSectionDtoNoCourse(section);

        assertEquals(10L, dto.id());
        assertEquals("002", dto.section());
        assertEquals("W1", dto.semester());
        assertEquals(2024, dto.year());
        assertEquals(SectionType.LECTURE, dto.type());
    }

    @Test
    void testToSectionDtoNoCourse_nullInput() {
        assertNull(mapper.toSectionDtoNoCourse(null));
    }

    @Test
    void testToCompletedCourseDto() {
        Course course = new Course("COSC", "Intro", "110");
        course.setId(1L);
        StudentCourse studentCourse = new StudentCourse();
        studentCourse.setCourse(course);
        studentCourse.setGrade(90);
        studentCourse.setClassAvg(85);

        CompletedCourseDto dto = mapper.toCompletedCourseDto(studentCourse);

        assertEquals("Intro", dto.course().name());
        assertEquals(90, dto.grade());
        assertEquals(85, dto.classAverage());
    }

    @Test
    void testToActiveEnrollmentDto() {
        Course course = new Course("COSC", "Intro", "110");
        Semester semester = new Semester(2024, "W1", null, null);
        course.setId(1L);

        Section section = new Section();
        section.setId(2L);
        section.setSemester(semester);
        section.setSection("001");
        section.setType(SectionType.LABORATORY);

        StudentCourse studentCourse = new StudentCourse();
        studentCourse.setCourse(course);
        studentCourse.setSection(section);
        studentCourse.setClassAvg(78);

        ActiveEnrollmentDto dto = mapper.toActiveEnrollmentDto(studentCourse);

        assertEquals("Intro", dto.course().name());
        assertEquals(78, dto.classAverage());
        assertEquals("001", dto.section().section());
    }

    @Test
    void testToOverviewDto() {
        Course course1 = new Course("COSC", "Intro", "110");
        course1.setId(1L);

        Course course2 = new Course("MATH", "Calc", "101");
        course2.setId(2L);
        Semester semester = new Semester(2024, "W1", null, null);

        Section section = new Section();
        section.setId(3L);
        section.setSemester(semester);
        section.setSection("A01");
        section.setType(SectionType.LECTURE);

        StudentCourse enrolled = new StudentCourse(1L, course1, EnrollmentStatus.ENROLLED, section, null, 80);
        StudentCourse completed = new StudentCourse(1L, course2, EnrollmentStatus.COMPLETED, null, 90, 85);

        UserDto student = new UserDto(2L,"Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT), 12345678, "COSC", 2025, 3, null,
                null, null, true);

        StudentEnrollmentOverviewDto overview = mapper.toOverviewDto(student, List.of(enrolled), List.of(completed));

        assertEquals("Alice", overview.student().firstName());
        assertEquals(1, overview.currentCourses().size());
        assertEquals(1, overview.completedCourses().size());
        assertEquals("Intro", overview.currentCourses().get(0).course().name());
        assertEquals("Calc", overview.completedCourses().get(0).course().name());
    }
}
