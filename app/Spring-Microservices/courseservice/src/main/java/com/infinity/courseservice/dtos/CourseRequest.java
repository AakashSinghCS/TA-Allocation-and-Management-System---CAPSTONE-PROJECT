package com.infinity.courseservice.dtos;

public record CourseRequest(
        String deptCode,
        String name,
        Integer courseNum) {}
