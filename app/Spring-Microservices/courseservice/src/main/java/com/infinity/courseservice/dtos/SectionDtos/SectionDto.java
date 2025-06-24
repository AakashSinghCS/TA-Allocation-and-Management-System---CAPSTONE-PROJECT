package com.infinity.courseservice.dtos.SectionDtos;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.enums.SectionType;

public record SectionDto(
    Long id,
    String term,
    String section,
    SectionType type,
    CourseDto course
) {}
