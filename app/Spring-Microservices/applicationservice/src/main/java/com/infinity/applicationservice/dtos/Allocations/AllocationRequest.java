package com.infinity.applicationservice.dtos.Allocations;

import com.infinity.applicationservice.enums.ApplicationStatus;

public record AllocationRequest(
        Long studentId,
        Long applicationId,
        ApplicationStatus status,
        int numberOfHours,
        Long sectionId) {
}
