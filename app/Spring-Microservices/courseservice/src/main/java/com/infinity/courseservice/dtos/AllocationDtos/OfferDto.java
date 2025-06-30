package com.infinity.courseservice.dtos.AllocationDtos;

public record OfferDto (
    Long id,
    boolean isAccepted,
    String description
){}
