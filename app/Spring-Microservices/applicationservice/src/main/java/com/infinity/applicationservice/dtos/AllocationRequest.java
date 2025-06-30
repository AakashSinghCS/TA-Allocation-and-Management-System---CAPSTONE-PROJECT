package com.infinity.applicationservice.dtos;

public record AllocationRequest(
    Long studentId,
    Long applicationId,
    boolean isConfirmed,
    int numberOfHours,
    Long sectionId
) {}
