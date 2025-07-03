package com.infinity.applicationservice.dtos.Users;


public record StudentDto(
    Long id,
    String firstName,
    String lastName,
    Integer studentNum,
    String program,
    Integer enrollmentYear,
    Integer schoolYear
) {}