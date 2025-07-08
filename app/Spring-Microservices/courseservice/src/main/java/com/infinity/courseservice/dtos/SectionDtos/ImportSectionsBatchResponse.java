package com.infinity.courseservice.dtos.SectionDtos;

import java.util.List;

public record ImportSectionsBatchResponse(
    Boolean success,
    List<ImportSectionResponse> results,
    List<String> errors,
    Integer totalProcessed,
    Integer totalCreated,
    Integer totalUpdated
) {}
