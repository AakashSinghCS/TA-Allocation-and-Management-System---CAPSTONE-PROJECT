package com.infinity.courseservice.dtos.QualificationDtos;

import com.infinity.courseservice.dtos.SectionDtos.SectionDtoNoCourse;

public record QualificationWithSectionDto(
    Long courseId,
    Long sectionId,
    SectionDtoNoCourse sectionDto,
    Long qualificationId,
    String courseDeptCode,
    String qualificationDescription
) {}
