package com.infinity.courseservice.dtos;

public record CourseFilterRequest(
        String deptCode,
        String name,
        Integer courseNum,
        String section,
        String term
        ) {}
