package com.infinity.courseservice.dtos.AllocationDtos;

import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.UserDtos.StudentDto;

public record AllocationDto(
    Long id,
    StudentDto student,
    boolean isConfirmed,
    int numberOfHours,
    SectionDto section
) {
    
}
 