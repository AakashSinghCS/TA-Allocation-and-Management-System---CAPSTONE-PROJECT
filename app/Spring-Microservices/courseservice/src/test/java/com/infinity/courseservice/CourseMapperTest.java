package com.infinity.courseservice;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.utility.CourseMapper;

public class CourseMapperTest {

    private final CourseMapper courseMapper = new CourseMapper();

    @Test
    void testCourseToDto() {
        Course course = new Course("COSC", "Software Engineering", "310");
        course.setId(1L);

        CourseDto dto = courseMapper.courseToDto(course);

        assertEquals(1L, dto.id());
        assertEquals("COSC", dto.deptCode());
        assertEquals("Software Engineering", dto.name());
        assertEquals("310", dto.courseNum());
    }
}
