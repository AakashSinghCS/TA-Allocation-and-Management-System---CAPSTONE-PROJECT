package com.infinity.courseservice.dtos.CourseDtos;

import java.util.List;

import com.infinity.courseservice.dtos.AllocationDtos.AllocationHistoryDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;

public record CourseNeedsAndAllocations(
        CourseDto course,
        List<NeedDto> need,
        List<AllocationHistoryDto> allocation
) {}
