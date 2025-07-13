package com.infinity.courseservice.dtos.AllocationDtos;

import com.infinity.courseservice.dtos.SectionDtos.SectionDtoNoCourse;
import com.infinity.courseservice.dtos.UserDtos.UserDto;

public record AllocationHistoryDto(
        Long id,
        UserDto student,
        OfferDto offer,
        boolean isConfirmed,
        int numberOfHours,
        SectionDtoNoCourse section) {

}