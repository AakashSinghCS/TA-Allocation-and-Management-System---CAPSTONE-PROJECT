package com.infinity.courseservice.dtos;

public record NeedDto(String description,
        Integer requiredGradingHours,
        Integer numHoursCurrentlyAllocated,
        Integer year,
        String semester) {}
