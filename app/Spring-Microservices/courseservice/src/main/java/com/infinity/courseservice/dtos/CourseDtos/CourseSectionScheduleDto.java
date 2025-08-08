package com.infinity.courseservice.dtos.CourseDtos;

import java.time.LocalTime;
import com.infinity.courseservice.enums.*;

public record CourseSectionScheduleDto(
        Long sectionId,
        Long courseId,
        String deptCode,
        String name,
        String courseNum,
        String section,
        Integer year,
        String semester,
        SectionType type,
        String scheduleDay,
        LocalTime startTime,
        LocalTime endTime,
        boolean isCourse
        ) {}
