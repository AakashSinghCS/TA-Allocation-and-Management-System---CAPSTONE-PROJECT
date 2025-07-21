package com.infinity.courseservice.dtos.CourseDtos;

import java.time.LocalTime;

import com.infinity.courseservice.dtos.SemesterDto;

public record CourseFilterRequest(
        String deptCode,
        String name,
        String courseNum,
        String section,
        SemesterDto semester,
        String type,
        String day,
        LocalTime startTime,
        LocalTime endTime
        ) {}
