package com.infinity.courseservice.dtos;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.UserDtos.StudentDto;

public record QualificationDtoWithId(
    Long id,
    CourseDto course,
    String description,
    StudentDto student
) {}