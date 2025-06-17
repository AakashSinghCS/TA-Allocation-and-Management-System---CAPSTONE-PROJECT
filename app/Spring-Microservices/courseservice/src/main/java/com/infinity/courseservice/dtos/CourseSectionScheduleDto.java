package com.infinity.courseservice.dtos;

import java.time.LocalTime;

public record CourseSectionScheduleDto(
        String deptCode,
        String name,
        Integer courseNum,
        String section,
        String term,
        String type,
        String day,
        LocalTime startTime,
        LocalTime endTime
        ) {}
