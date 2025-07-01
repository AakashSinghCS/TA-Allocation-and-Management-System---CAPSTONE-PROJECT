package com.infinity.courseservice.dtos.EnrollmentDtos;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;

public record CompletedCourseDto(
        CourseDto course,
        Integer grade,
        Integer classAverage) {
}
