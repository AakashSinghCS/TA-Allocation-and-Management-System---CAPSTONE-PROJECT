package com.infinity.applicationservice.dtos.Needs;

import java.util.List;

import com.infinity.applicationservice.dtos.Courses.CourseDto;

public record NeedDto(
        Long id,
        Long courseId,
        String description,
        int requiredGradingHours,
        int numHoursCurrentlyAllocated,
        Integer year,
        String semester,
        List<CourseDto> prerequisites
        ) {}
