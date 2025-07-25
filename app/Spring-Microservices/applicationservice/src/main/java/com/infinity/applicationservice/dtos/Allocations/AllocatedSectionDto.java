package com.infinity.applicationservice.dtos.Allocations;

public record AllocatedSectionDto(
    Long id,
    Long allocationId,
    Long sectionId,
    String task
) {
    
    public AllocatedSectionDto(Long id, Long allocationId, Long sectionId, String task) {
        this.id = id;
        this.allocationId = allocationId;
        this.sectionId = sectionId;
        this.task = task;
    }
}
