package com.infinity.applicationservice.dtos;

public record AllocationDto(
    Long id,
    StudentDto student,
    boolean isConfirmed,
    int numberOfHours,
    SectionDto section
) {
    
}
 