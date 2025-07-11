package com.infinity.applicationservice.dtos.Allocations;


import io.micrometer.common.lang.Nullable;

public record ImportCourseRequest(
        @Nullable String deptCode,
        @Nullable String courseNum
        ) {}
