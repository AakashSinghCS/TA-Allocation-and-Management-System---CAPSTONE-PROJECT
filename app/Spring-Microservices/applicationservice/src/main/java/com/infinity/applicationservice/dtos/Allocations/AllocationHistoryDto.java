package com.infinity.applicationservice.dtos.Allocations;

import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Courses.SectionDto;
import com.infinity.applicationservice.dtos.Users.StudentDto;
import com.infinity.applicationservice.enums.ApplicationStatus;

public record AllocationHistoryDto(
    Long id,
    StudentDto student,
    ApplicationDto applicationDto,
    ApplicationStatus status,
    int numberOfHours,
    SectionDto section) {
    
}
