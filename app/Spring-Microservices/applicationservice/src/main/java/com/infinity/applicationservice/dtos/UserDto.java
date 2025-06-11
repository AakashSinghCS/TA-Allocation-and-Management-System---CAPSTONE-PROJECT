package com.infinity.applicationservice.dtos;

public record UserDto(Long id, String firstName, String lastName, UserRole role) {
}
