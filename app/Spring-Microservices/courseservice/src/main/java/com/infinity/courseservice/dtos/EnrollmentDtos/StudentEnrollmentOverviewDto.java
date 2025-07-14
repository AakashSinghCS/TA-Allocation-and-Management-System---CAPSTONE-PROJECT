package com.infinity.courseservice.dtos.EnrollmentDtos;

import java.util.List;

import com.infinity.courseservice.dtos.UserDtos.UserDto;

public record StudentEnrollmentOverviewDto(
        UserDto student,
        List<ActiveEnrollmentDto> currentCourses,
        List<CompletedCourseDto> completedCourses) {
}
