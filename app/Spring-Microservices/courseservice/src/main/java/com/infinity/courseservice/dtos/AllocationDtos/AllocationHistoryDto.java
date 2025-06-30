package com.infinity.courseservice.dtos.AllocationDtos;

import com.infinity.courseservice.dtos.SectionDtos.SectionDtoNoCourse;
import com.infinity.courseservice.dtos.UserDtos.StudentDto;

public record AllocationHistoryDto(
        Long id,
        StudentDto student,
        OfferDto offer,
        boolean isConfirmed,
        int numberOfHours,
        SectionDtoNoCourse section) {

}