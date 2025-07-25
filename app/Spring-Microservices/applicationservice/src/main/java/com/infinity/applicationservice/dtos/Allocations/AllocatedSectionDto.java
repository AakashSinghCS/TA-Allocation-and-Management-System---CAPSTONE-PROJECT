package com.infinity.applicationservice.dtos.Allocations;

import com.infinity.applicationservice.enums.TaskType;

public record AllocatedSectionDto(
    Long id,
    Long allocationId,
    Long sectionId,
    TaskType task
) {

    public AllocatedSectionDto(Long id, Long allocationId, Long sectionId, TaskType task) {
        this.id = id;
        this.allocationId = allocationId;
        this.sectionId = sectionId;
        this.task = task;
    }
}
