package com.infinity.courseservice.dtos.NeedDtos;

import java.util.List;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;

public record NeedDto(
        Long id,
        Long courseId,
        String description,
        Integer requiredGradingHours,
        Integer numHoursCurrentlyAllocated,
        Integer year,
        String semester,
        List<CourseDto> prerequisites
        ) {}
