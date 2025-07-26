package com.infinity.applicationservice.dtos.Allocations;

import org.springframework.scheduling.config.Task;

import com.infinity.applicationservice.enums.ApplicationStatus;
import com.infinity.applicationservice.enums.TaskType;

public record AllocationRequest(
        Long studentId,
        Long applicationId,
        TaskType task,
        int hours,
        Long sectionId) {
}
