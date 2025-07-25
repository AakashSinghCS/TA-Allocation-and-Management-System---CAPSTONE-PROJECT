package com.infinity.courseservice.dtos.CourseDtos;

import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.enums.Semester;

public record StudentTaughtCourseDto(Long id, UserDto student, CourseDto course, Semester semester, int year) {}

