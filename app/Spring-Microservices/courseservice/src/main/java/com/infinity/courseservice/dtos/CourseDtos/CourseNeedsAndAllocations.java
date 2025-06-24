package com.infinity.courseservice.dtos.CourseDtos;

import com.infinity.courseservice.dtos.AllocationDtos.AllocationHistoryDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;

public record CourseNeedsAndAllocations(
        CourseDto course,
        NeedDto need,
        AllocationHistoryDto allocation
) {}
