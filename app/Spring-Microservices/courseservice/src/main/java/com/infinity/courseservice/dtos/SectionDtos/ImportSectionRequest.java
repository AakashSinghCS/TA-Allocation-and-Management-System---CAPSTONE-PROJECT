package com.infinity.courseservice.dtos.SectionDtos;

public record ImportSectionRequest(
    String deptCode,
    String courseNum,
    String name,
    Integer year,
    String semester,
    String section,
    String type,
    String day,
    String startTime,
    String endTime
) {}
