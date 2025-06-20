package com.infinity.userservice.dtos;

import com.infinity.userservice.enums.UserRole;

public record UserDto(Long id, String firstName, String lastName, UserRole role) {
}
