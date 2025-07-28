package com.infinity.courseservice.dtos.QualificationDtos;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.UserDtos.UserDto;

public record QualificationDto(
    Long id,
    CourseDto course,
    String description,
    UserDto student
) {}