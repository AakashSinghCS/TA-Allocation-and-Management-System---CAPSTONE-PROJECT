package com.infinity.courseservice.dtos.SectionDtos;

import com.infinity.courseservice.enums.SectionType;

public record SectionDtoNoCourse(
    Long id,
    Integer year,
    String semester,
    String section,
    SectionType type
) {}
