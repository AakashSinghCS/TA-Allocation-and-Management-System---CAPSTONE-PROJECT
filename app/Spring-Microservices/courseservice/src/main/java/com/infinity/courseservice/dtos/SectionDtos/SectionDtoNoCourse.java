package com.infinity.courseservice.dtos.SectionDtos;

import com.infinity.courseservice.dtos.SemesterDto;
import com.infinity.courseservice.enums.SectionType;

public record SectionDtoNoCourse(
    Long id,
    SemesterDto semester,
    String section,
    SectionType type
) {}
