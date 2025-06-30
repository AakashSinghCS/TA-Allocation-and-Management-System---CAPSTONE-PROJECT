package com.infinity.courseservice.dtos;

public record StudentQualificationResponseDto(
    Long dummyQualificationId,
    CourseDto course,
    String description,
    StudentDto student
) {
    
}
