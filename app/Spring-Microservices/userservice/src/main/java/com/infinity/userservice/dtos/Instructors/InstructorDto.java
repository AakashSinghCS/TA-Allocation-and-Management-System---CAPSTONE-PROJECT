package com.infinity.userservice.dtos.Instructors;

import java.time.LocalDateTime;

import com.infinity.userservice.dtos.BaseUserDto;

import com.infinity.userservice.dtos.BaseUserDto;

public record InstructorDto(
    Long id,
    String firstName,
    String lastName,
    String email,
    Integer employeeNum,
    String dept,
    LocalDateTime createdAt
) implements BaseUserDto{}

