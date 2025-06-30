package com.infinity.courseservice.dtos.NeedDtos;

public record NeedDto(
        Long id,
        Long courseId,
        String description,
        Integer requiredGradingHours,
        Integer numHoursCurrentlyAllocated,
        Integer year,
        String semester
        ) {}
