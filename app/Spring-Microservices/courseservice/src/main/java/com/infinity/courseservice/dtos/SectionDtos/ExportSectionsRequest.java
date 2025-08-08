package com.infinity.courseservice.dtos.SectionDtos;

import java.util.List;

public record ExportSectionsRequest(
    List<Long> sectionIds
) {}
