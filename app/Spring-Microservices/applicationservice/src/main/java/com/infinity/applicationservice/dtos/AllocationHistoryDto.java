package com.infinity.applicationservice.dtos;


public record AllocationHistoryDto(
    Long id,
    StudentDto student,
    OfferDto offer,
    boolean isConfirmed,
    int numberOfHours,
    SectionDto section) {
    
}
