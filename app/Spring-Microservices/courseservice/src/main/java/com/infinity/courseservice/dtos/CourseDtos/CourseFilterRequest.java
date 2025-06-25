package com.infinity.courseservice.dtos.CourseDtos;

import java.time.LocalTime;

public record CourseFilterRequest(
        String deptCode,
        String name,
        String courseNum,
        String section,
        Integer year,
        String semester,
        String type,
        String day,
        LocalTime startTime,
        LocalTime endTime
        ) {}
