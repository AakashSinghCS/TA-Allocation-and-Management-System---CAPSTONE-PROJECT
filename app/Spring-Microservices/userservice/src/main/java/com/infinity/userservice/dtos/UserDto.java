package com.infinity.userservice.dtos;

public record UserDto(Long id, String firstName, String lastName, UserRole role) {
}
