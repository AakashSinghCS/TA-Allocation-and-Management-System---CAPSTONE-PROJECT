package com.infinity.courseservice.dtos.SectionDtos;

import java.util.List;

public record ImportSectionsBatchRequest(
    List<ImportSectionRequest> sections
) {}
