package com.infinity.applicationservice.dtos;

import com.infinity.applicationservice.enums.*;

public record UserDto(Long id, String firstName, String lastName, UserRole role) {
}
