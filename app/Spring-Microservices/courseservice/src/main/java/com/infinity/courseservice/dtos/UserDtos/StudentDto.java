package com.infinity.courseservice.dtos.UserDtos;

public record StudentDto(
    Long id,
    String firstName,
    String lastName,
    Integer studentNum,
    String program,
    Integer enrollmentYear,
    Integer schoolYear
) {}