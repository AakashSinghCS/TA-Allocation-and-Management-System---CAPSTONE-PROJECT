package com.infinity.userservice.dtos.Instructors;

import java.time.LocalDateTime;

public record InstructorDto(
    Long id,
    String firstName,
    String lastName,
    Integer employeeNum,
    String dept,
    LocalDateTime createdAt
        
) {

}
