package com.infinity.courseservice.dtos.NeedDtos;

import java.util.List;

public record NeedRequest(String description,
        Integer requiredGradingHours,
        Integer numHoursCurrentlyAllocated,
        Integer year,
        String semester,
        List<Long> prerequisiteCourseIds) {}
