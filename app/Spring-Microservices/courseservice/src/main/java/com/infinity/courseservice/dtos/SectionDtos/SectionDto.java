package com.infinity.courseservice.dtos.SectionDtos;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.enums.SectionType;

public record SectionDto(
    Long id,
    Integer year,
    String semester,
    String section,
    SectionType type,
    CourseDto course,
    Integer numberOfTAsAllocated
) {}
