package com.infinity.courseservice.dtos.AllocationDtos;

import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.UserDtos.UserDto;

public record AllocationHistoryDtoWithCourse(
        Long id,
        UserDto student,
        OfferDto offer,
        boolean isConfirmed,
        int numberOfHours,
        SectionDto section) {

}