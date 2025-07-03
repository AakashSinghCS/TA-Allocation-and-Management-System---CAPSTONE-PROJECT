package com.infinity.applicationservice.dtos.Courses;

import com.infinity.applicationservice.enums.*;

public record SectionDto(
        Long id,
        Integer year,
        String semester,
        String section,
        SectionType type,
        CourseDto course) {
}
