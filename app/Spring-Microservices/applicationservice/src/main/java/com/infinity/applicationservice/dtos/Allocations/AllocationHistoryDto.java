package com.infinity.applicationservice.dtos.Allocations;

import java.util.List;

import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.ApplicationStatus;
import com.infinity.applicationservice.models.AllocatedSection;

public record AllocationHistoryDto(
    Long id,
    UserDto student,
    ApplicationDto applicationDto,
    ApplicationStatus status,
    double labPrepHours,
    int gradingHours,
    double sectionHours,
    List<AllocatedSection> allocatedSections) {
    
}
