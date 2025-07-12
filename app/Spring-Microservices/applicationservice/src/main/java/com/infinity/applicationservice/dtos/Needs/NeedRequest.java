package com.infinity.applicationservice.dtos.Needs;

import java.util.List;

public record NeedRequest(String description,
        int requiredGradingHours,
        int numHoursCurrentlyAllocated,
        Integer year,
        String semester,
        List<Long> prerequisiteCourseIds) {}
