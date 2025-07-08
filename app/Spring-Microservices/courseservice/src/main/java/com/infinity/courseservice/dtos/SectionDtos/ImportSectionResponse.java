package com.infinity.courseservice.dtos.SectionDtos;

public record ImportSectionResponse(
    Boolean success,
    Boolean created,
    Long sectionId,
    String message
) {}
