package com.infinity.courseservice.dtos;

public record CourseSectionDto(
        String deptCode,
        String name,
        Integer courseNum,
        String section,
        String term
        ) {}
