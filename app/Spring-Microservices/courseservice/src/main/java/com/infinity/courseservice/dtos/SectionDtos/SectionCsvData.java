package com.infinity.courseservice.dtos.SectionDtos;

/**
 * DTO for CSV export/import of section data.
 * This record has the same structure as ImportSectionRequest to enable
 * seamless export -> edit -> import workflow.
 */
public record SectionCsvData(
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
