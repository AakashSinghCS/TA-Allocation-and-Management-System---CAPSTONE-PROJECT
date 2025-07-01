package com.infinity.userservice.dtos.Students;

import java.time.LocalDateTime;

import com.infinity.userservice.dtos.BaseUserDto;

public record StudentDto(
    Long id,
    String firstName,
    String lastName,
    String email,
    Integer studentNum,
    String program,
    Integer enrollmentYear,
    Integer schoolYear,
    LocalDateTime createdAt
) implements BaseUserDto{}