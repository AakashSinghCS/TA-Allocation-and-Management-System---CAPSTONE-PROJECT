package com.infinity.courseservice.dtos;

import com.infinity.courseservice.enums.*;
import io.micrometer.common.lang.Nullable;

public record CourseRequest(
        @Nullable String deptCode,
        @Nullable String name,
        @Nullable String courseNum,
        @Nullable String section,
        @Nullable SectionType type,
        @Nullable String term,
        @Nullable String day,
        @Nullable String startTime,
        @Nullable String endTime
        ) {}
