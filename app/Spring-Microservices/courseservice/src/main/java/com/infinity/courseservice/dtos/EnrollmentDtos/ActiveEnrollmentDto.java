package com.infinity.courseservice.dtos.EnrollmentDtos;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoNoCourse;

public record ActiveEnrollmentDto(
        CourseDto course,
        SectionDtoNoCourse section,
        Integer classAverage) {
}
