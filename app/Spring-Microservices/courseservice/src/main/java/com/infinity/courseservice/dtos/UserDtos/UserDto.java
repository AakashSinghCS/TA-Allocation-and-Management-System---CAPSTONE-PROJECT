package com.infinity.courseservice.dtos.UserDtos;

import java.time.LocalDateTime;
import java.util.List;

import com.infinity.courseservice.enums.UserRole;

public record UserDto(
        Long id,
        String firstName,
        String lastName,
        String email,
        List<UserRole> roles,
        Integer studentNum,
        String program,
        Integer enrollmentYear,
        Integer schoolYear,
        Integer employeeNum,
        String dept,
        LocalDateTime created,
        boolean active) {
}
