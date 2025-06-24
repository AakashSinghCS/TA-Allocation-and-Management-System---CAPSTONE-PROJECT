package com.infinity.courseservice.dtos.AllocationDtos;

import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.UserDtos.StudentDto;

public record AllocationHistoryDto(
        Long id,
        StudentDto student,
        OfferDto offer,
        boolean isConfirmed,
        int numberOfHours,
        SectionDto section) {

}