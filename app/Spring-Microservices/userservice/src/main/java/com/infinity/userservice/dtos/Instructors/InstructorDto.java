package com.infinity.userservice.dtos.Instructors;

import java.time.LocalDateTime;

import com.infinity.userservice.enums.UserRole;

public record InstructorDto(
    Long id,
    String firstName,
    String lastName,
    UserRole role,
    Integer studentNum,
    String program,
    Integer enrollmentYear,
    Integer schoolYear,
    LocalDateTime createdAt
        
) {

}
