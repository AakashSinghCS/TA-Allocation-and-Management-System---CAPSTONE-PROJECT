package com.infinity.courseservice.dtos.UserDtos;

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
