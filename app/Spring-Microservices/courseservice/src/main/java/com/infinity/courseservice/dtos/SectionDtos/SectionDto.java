package com.infinity.courseservice.dtos.SectionDtos;

import com.infinity.courseservice.dtos.SemesterDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.enums.SectionType;

public record SectionDto(
    Long id,
    SemesterDto semester,
    String section,
    SectionType type,
    CourseDto course
) {}
