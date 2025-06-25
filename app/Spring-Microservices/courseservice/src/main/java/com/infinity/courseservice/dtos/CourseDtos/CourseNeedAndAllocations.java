package com.infinity.courseservice.dtos.CourseDtos;

import java.util.List;

import com.infinity.courseservice.dtos.AllocationDtos.AllocationHistoryDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;

public record CourseNeedAndAllocations(
        CourseDto course,
        NeedDto need,
        List<AllocationHistoryDto> allocations
) {}
