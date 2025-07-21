package com.infinity.courseservice.dtos.NeedDtos;

import java.util.List;

import com.infinity.courseservice.dtos.SemesterDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;

public record NeedDto(
        Long id,
        Long courseId,
        String description,
        int requiredGradingHours,
        int numHoursCurrentlyAllocated,
        SemesterDto semester,
        List<CourseDto> prerequisites
        ) {}
