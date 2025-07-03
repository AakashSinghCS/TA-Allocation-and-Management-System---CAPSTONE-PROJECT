package com.infinity.applicationservice.dtos.Allocations;

import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Courses.SectionDto;
import com.infinity.applicationservice.dtos.Users.StudentDto;

public record AllocationHistoryDto(
    Long id,
    StudentDto student,
    ApplicationDto applicationDto,
    boolean isConfirmed,
    int numberOfHours,
    SectionDto section) {
    
}
