package com.infinity.userservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.userservice.dtos.InstructorDto;
import com.infinity.userservice.models.Instructor;

@Component
public class InstructorMapper {
    public InstructorDto toDto(Instructor instructor) {
        return new InstructorDto(
            instructor.getId(),
            instructor.getFirstName(),
            instructor.getLastName(),
            instructor.getEmail(),
            instructor.getEmployeeNumber(),
            instructor.getDepartment(),
            instructor.getCreatedAt()
        );
    }
}
