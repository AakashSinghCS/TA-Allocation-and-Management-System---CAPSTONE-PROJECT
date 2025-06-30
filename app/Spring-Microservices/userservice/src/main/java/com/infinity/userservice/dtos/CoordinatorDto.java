package com.infinity.userservice.dtos;

import java.time.LocalDateTime;

public record CoordinatorDto(
    Long id,
    String firstName,
    String lastName,
    String email,
    LocalDateTime createdAt
) implements BaseUserDto{}