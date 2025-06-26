package com.infinity.userservice.dtos;

import java.time.LocalDateTime;

public record InstructorDto(
    Long id,
    String firstName,
    String lastName,
    String email,
    Integer employeeNum,
    String department,
    LocalDateTime createdAt
) {}
