package com.infinity.courseservice.dtos.CourseDtos;

import java.util.List;

import com.infinity.courseservice.dtos.AllocationDtos.AllocationHistoryDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;

public record CourseNeedAndAllocations(
        SectionDto section,
        NeedDto need,
        List<AllocationHistoryDto> allocations
) {}
