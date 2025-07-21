package com.infinity.courseservice.dtos.CourseDtos;

import com.infinity.courseservice.dtos.SemesterDto;
import com.infinity.courseservice.dtos.UserDtos.UserDto;

public record StudentTaughtCourseDto(UserDto student, CourseDto course, SemesterDto semester) {}

