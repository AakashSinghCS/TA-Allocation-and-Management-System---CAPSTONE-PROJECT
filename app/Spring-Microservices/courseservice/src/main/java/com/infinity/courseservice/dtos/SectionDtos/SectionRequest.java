package com.infinity.courseservice.dtos.SectionDtos;

import com.infinity.courseservice.enums.SectionType;

public record SectionRequest(
        Long id,
    Integer year,
    String semester,
    String section,
    SectionType type,
    Long courseId) {}