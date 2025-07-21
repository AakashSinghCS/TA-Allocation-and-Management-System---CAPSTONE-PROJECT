package com.infinity.courseservice.dtos.SectionDtos;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.enums.SectionType;

public record SectionDtoWithInstructorId(
    Long id,
    Long instructorId,
    Integer year,
    String semester,
    String section,
    SectionType type,
    CourseDto course
) {}
