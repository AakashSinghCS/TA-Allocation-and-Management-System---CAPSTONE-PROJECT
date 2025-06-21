package com.infinity.applicationservice.dtos;

import com.infinity.applicationservice.models.Offer;

public record AllocationHistoryDto(
    Long id,
    StudentDto student,
    Offer offer,
    boolean isConfirmed,
    int numberOfHours,
    SectionDto section) {
    
}
