package com.infinity.courseservice.dtos.SectionDtos;

import com.infinity.courseservice.enums.SectionType;

public record SectionDtoNoCourse(
    Long id,
    String term,
    String section,
    SectionType type
) {}
