package com.infinity.courseservice.dtos;

import io.micrometer.common.lang.Nullable;

public record CourseRequest(
        @Nullable String deptCode,
        @Nullable String name,
        @Nullable Integer courseNum,
        @Nullable String section,
        @Nullable String type,
        @Nullable String term,
        @Nullable String day,
        @Nullable String startTime,
        @Nullable String endTime
        ) {}
