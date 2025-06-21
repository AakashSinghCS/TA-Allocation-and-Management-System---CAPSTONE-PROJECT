package com.infinity.applicationservice.dtos;

public record AllocationRequest(
    Long studentId,
    Long offerId,
    boolean isConfirmed,
    int numberOfHours,
    Long sectionId
) {}
