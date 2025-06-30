package com.infinity.courseservice;

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
import com.infinity.courseservice.dtos.UserDtos.StudentDto;
import com.infinity.courseservice.enums.EnrollmentStatus;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
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
        Section section = new Section();
        section.setId(10L);
        section.setYear(2024);
        section.setSemester("Fall");
        section.setSection("002");
        section.setType(SectionType.LECTURE);

        SectionDtoNoCourse dto = mapper.toSectionDtoNoCourse(section);

        assertEquals(10L, dto.id());
        assertEquals("002", dto.section());
        assertEquals("Fall", dto.semester());
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
        course.setId(1L);

        Section section = new Section();
        section.setId(2L);
        section.setYear(2024);
        section.setSemester("Winter");
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

        Section section = new Section();
        section.setId(3L);
        section.setYear(2023);
        section.setSemester("Fall");
        section.setSection("A01");
        section.setType(SectionType.LECTURE);

        StudentCourse enrolled = new StudentCourse(1L, course1, EnrollmentStatus.ENROLLED, section, null, 80);
        StudentCourse completed = new StudentCourse(1L, course2, EnrollmentStatus.COMPLETED, null, 90, 85);

        StudentDto student = new StudentDto(1L, "Alex", "Warg", 123456, "COSC", 2021, 4);

        StudentEnrollmentOverviewDto overview = mapper.toOverviewDto(student, List.of(enrolled), List.of(completed));

        assertEquals("Alex", overview.student().firstName());
        assertEquals(1, overview.currentCourses().size());
        assertEquals(1, overview.completedCourses().size());
        assertEquals("Intro", overview.currentCourses().get(0).course().name());
        assertEquals("Calc", overview.completedCourses().get(0).course().name());
    }
}
