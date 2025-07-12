package com.infinity.applicationservice.dtos.Allocations;


import io.micrometer.common.lang.Nullable;

public record ImportSectionRequest(
        @Nullable String section,
        @Nullable Integer year,
        @Nullable String semester
        ) {}
