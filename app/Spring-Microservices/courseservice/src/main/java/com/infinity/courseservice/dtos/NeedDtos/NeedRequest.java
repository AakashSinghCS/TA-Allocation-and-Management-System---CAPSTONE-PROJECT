package com.infinity.courseservice.dtos.NeedDtos;

public record NeedRequest(String description,
        Integer requiredGradingHours,
        Integer numHoursCurrentlyAllocated,
        Integer year,
        String semester) {}
