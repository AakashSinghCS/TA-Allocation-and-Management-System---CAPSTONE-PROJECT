package com.infinity.userservice.dtos;

import java.time.LocalDateTime;

public record StudentDto(
    Long id,
    String firstName,
    String lastName,
    Integer studentNum,
    String program,
    Integer enrollmentYear,
    Integer schoolYear,
    LocalDateTime createdAt
) {}