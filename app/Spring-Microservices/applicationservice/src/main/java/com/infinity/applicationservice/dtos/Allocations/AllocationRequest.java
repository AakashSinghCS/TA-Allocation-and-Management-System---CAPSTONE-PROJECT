package com.infinity.applicationservice.dtos.Allocations;

import com.infinity.applicationservice.enums.TaskType;

public record AllocationRequest(
        Long studentId,
        Long applicationId,
        TaskType task,
        double hours,
        Long sectionId) {
}
