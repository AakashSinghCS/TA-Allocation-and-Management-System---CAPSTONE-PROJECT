package com.infinity.courseservice.dtos.QualificationDtos;

import com.infinity.courseservice.enums.SectionType;

public record QualificationWithSectionDto(
    Long courseId,
    Long sectionId,
    Integer year,
    String semester,
    String sectionName,
    SectionType sectionType,
    Long qualificationId,
    String courseDeptCode,
    String qualificationDescription
) {}
