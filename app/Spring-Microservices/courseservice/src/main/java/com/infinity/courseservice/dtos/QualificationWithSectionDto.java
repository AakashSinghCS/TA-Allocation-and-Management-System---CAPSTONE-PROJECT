package com.infinity.courseservice.dtos;

import com.infinity.courseservice.enums.SectionType;

public record QualificationWithSectionDto(
    Long sectionId,
    Integer year,
    String semester,
    String sectionName,
    SectionType sectionType,
    Long qualificationId,
    String courseDeptCode,
    String qualificationDescription
) {}
