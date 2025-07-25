package com.infinity.applicationservice.dtos.Allocations;

import com.infinity.applicationservice.enums.ApplicationStatus;

public record AllocationRequest(
        Long studentId,
        Long applicationId,
        ApplicationStatus status,
        String task,
        int labPrepHours,
        int gradingHours,
        int sectionHours,
        Long sectionId) {
}
