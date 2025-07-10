package com.infinity.applicationservice.dtos.Users;


public record StudentDto(
    Long id,
    String firstName,
    String lastName,
    String email,
    Integer studentNum,
    String program,
    Integer enrollmentYear,
    Integer schoolYear
) {}