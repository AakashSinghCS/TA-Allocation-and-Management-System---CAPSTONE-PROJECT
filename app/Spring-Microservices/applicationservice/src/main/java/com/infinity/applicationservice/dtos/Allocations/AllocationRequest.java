package com.infinity.applicationservice.dtos.Allocations;

import com.infinity.applicationservice.enums.TaskType;

public record AllocationRequest(
        Long studentId,
        Long applicationId,
        TaskType task,
        int hours,
        Long sectionId) {
}
