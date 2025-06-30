package com.infinity.userservice.dtos.Instructors;

import java.time.LocalDateTime;

public record InstructorDto(
    Long id,
    String firstName,
    String lastName,
    String email,
    Integer employeeNum,
    String dept,
    LocalDateTime createdAt
        
) {

}
