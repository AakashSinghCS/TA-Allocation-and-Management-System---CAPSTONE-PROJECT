package com.infinity.courseservice.dtos;

import java.time.LocalTime;
import com.infinity.courseservice.enums.*;

public record CourseSectionScheduleDto(
        String deptCode,
        String name,
        String courseNum,
        String section,
        String term,
        SectionType type,
        String day,
        LocalTime startTime,
        LocalTime endTime
        ) {}
