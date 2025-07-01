package com.infinity.courseservice.dtos.EnrollmentDtos;

import java.util.List;

import com.infinity.courseservice.dtos.UserDtos.StudentDto;

public record StudentEnrollmentOverviewDto(
        StudentDto student,
        List<ActiveEnrollmentDto> currentCourses,
        List<CompletedCourseDto> completedCourses) {
}
