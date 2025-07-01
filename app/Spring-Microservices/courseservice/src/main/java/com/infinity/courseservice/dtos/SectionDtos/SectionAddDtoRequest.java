package com.infinity.courseservice.dtos.SectionDtos;

import java.util.List;

import com.infinity.courseservice.enums.SectionType;

import io.micrometer.common.lang.Nullable;

public record SectionAddDtoRequest(
        @Nullable String deptCode,
        @Nullable String name,
        @Nullable String courseNum,
        @Nullable String section,
        @Nullable SectionType type,
        @Nullable Integer year,
        @Nullable String semester,
        @Nullable List<SectionScheduleDto> sectionSchedules,
        @Nullable Long instructorId
        ) {}
