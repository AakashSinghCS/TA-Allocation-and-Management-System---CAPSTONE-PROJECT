package com.infinity.courseservice.dtos;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.UserDtos.UserDto;

public record QualificationDtoWithId(
    Long id,
    CourseDto course,
    String description,
    UserDto student
) {}