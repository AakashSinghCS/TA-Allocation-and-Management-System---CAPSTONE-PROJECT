package com.infinity.courseservice.dtos.CourseDtos;

import java.time.LocalTime;

import com.infinity.courseservice.enums.SectionType;

public record CourseFilterRequest(
        String deptCode,
        String name,
        String courseNum,
        String section,
        Integer year,
        String semester,
        SectionType type,
        String day,
        LocalTime startTime,
        LocalTime endTime,
        String searchText
        ) {}
