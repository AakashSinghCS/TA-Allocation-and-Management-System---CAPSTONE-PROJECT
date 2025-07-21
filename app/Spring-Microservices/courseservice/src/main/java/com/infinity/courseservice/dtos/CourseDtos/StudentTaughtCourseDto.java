package com.infinity.courseservice.dtos.CourseDtos;

import com.infinity.courseservice.dtos.UserDtos.UserDto;

public record StudentTaughtCourseDto(UserDto student, CourseDto course, Integer year, String semester) {}

