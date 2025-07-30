package com.infinity.courseservice;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.StudentTaughtCourseDto;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.models.StudentTaughtCourse;
import com.infinity.courseservice.utility.CourseMapper;
import com.infinity.courseservice.utility.StudentTaughtCourseMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StudentTaughtCourseMapperTest {

    private CourseMapper courseMapper;
    private StudentTaughtCourseMapper studentTaughtCourseMapper;

    @BeforeEach
    void setUp() {
        courseMapper = mock(CourseMapper.class);
        studentTaughtCourseMapper = new StudentTaughtCourseMapper(courseMapper);
    }

    @Test
    void toDto_mapsCorrectly() {
        Course course = new Course();
        Semester semester = new Semester(2024, "W2", null, null, true);

        StudentTaughtCourse record = new StudentTaughtCourse();
        record.setCourse(course);
        record.setSemester(semester);

        UserDto userDto = new UserDto(1L, "Test", "Tester", "test@test.com", null, null, null, null,null, null, null, null, false);

        CourseDto courseDto = new CourseDto(10L, "COSC", "Capstone", "499");
        when(courseMapper.courseToDto(course)).thenReturn(courseDto);

        StudentTaughtCourseDto result = studentTaughtCourseMapper.toDto(userDto, record);

        assertEquals(userDto, result.student());
        assertEquals(courseDto, result.course());
        assertEquals(2024, result.year());
        assertEquals("W2", result.semester());
    }
}
