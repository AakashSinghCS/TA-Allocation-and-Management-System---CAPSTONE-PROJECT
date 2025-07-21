package com.infinity.courseservice.dtos.NeedDtos;

import java.util.List;

import com.infinity.courseservice.dtos.SemesterDto;

public record NeedRequest(String description,
        int requiredGradingHours,
        int numHoursCurrentlyAllocated,
        SemesterDto semester,
        List<Long> prerequisiteCourseIds) {}
