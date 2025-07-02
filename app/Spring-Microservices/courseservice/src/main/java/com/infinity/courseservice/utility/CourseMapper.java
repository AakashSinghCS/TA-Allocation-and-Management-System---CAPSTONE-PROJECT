package com.infinity.courseservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.models.Course;

@Component
public class CourseMapper {
    
    public CourseDto courseToDto(Course course) {
        return new CourseDto(course.getId(), course.getDeptCode(), course.getName(), course.getCourseNum());
    }
}
