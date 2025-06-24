package com.infinity.courseservice.dtos.NeedDtos;

public record NeedDto(
        Long id,
        String description,
        Integer requiredGradingHours,
        Integer numHoursCurrentlyAllocated
        ) {}
