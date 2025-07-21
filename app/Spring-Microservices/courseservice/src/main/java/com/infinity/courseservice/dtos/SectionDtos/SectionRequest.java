package com.infinity.courseservice.dtos.SectionDtos;

import com.infinity.courseservice.dtos.SemesterDto;
import com.infinity.courseservice.enums.SectionType;

public record SectionRequest(
        Long id,
    SemesterDto semester,
    String section,
    SectionType type,
    Long courseId) {}