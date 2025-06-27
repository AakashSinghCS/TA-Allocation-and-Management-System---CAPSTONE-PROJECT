package com.infinity.applicationservice.dtos;

import com.infinity.applicationservice.enums.*;

public record SectionDto(
    Long id,
    String term,
    String section,
    SectionType type,
    CourseDto course) {}
