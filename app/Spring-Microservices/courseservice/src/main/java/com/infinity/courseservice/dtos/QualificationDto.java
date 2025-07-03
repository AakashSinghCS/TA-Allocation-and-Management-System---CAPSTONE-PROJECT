package com.infinity.courseservice.dtos;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.UserDtos.StudentDto;

public record QualificationDto(
    CourseDto course,
    String description,
    StudentDto student
) {}