package com.infinity.userservice.dtos;

import java.time.LocalDateTime;
import com.infinity.userservice.enums.UserRole;

public record StudentDto(
    Long id,
    String firstName,
    String lastName,
    UserRole role,
    Integer studentNum,
    String program,
    Integer enrollmentYear,
    Integer schoolYear,
    LocalDateTime createdAt
) {}