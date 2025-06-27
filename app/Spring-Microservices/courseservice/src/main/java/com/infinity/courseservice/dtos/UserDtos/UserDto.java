package com.infinity.courseservice.dtos.UserDtos;

import com.infinity.courseservice.enums.UserRole;

public record UserDto(Long id, String firstName, String lastName, UserRole role) {
}
