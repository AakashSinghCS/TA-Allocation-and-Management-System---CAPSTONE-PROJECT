package com.infinity.userservice.dtos.Students;

import java.time.LocalDateTime;

public record StudentDto(
    Long id,
    String firstName,
    String lastName,
    String email,
    Integer studentNumber,
    String program,
    Integer enrollmentYear,
    Integer schoolYear,
    LocalDateTime createdAt
) implements BaseUserDto{}