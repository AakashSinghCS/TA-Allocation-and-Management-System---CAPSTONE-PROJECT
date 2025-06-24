package com.infinity.userservice.dtos;

import java.util.List;

import com.infinity.userservice.enums.UserRole;

public record UserDto(Long id, String firstName, String lastName, String email, List<UserRole> roles) {
}
