package com.infinity.courseservice.dtos.CourseDtos;

import com.infinity.courseservice.enums.SectionType;

import io.micrometer.common.lang.Nullable;

public record CourseRequest(
        @Nullable String deptCode,
        @Nullable String name,
        @Nullable String courseNum,
        @Nullable String section,
        @Nullable SectionType type,
        @Nullable Integer year,
        @Nullable String semester,
        @Nullable String day,
        @Nullable String startTime,
        @Nullable String endTime,
        @Nullable Long instructorId
        ) {}
