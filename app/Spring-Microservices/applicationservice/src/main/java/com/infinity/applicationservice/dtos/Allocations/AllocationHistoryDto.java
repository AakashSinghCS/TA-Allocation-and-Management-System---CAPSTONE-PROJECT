package com.infinity.applicationservice.dtos.Allocations;

import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Courses.SectionDto;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.ApplicationStatus;

public record AllocationHistoryDto(
    Long id,
    UserDto student,
    ApplicationDto applicationDto,
    ApplicationStatus status,
    int numberOfHours,
    SectionDto section) {
    
}
