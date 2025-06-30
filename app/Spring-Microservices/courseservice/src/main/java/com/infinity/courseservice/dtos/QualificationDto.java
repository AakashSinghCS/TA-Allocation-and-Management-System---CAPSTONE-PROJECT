package com.infinity.courseservice.dtos;

public record QualificationDto(
    CourseDto course,
    String description,
    StudentDto student
) {}