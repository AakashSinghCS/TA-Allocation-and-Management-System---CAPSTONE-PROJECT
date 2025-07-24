package com.infinity.courseservice.dtos.AllocationDtos;

import com.infinity.courseservice.dtos.SectionDtos.SectionDtoNoCourse;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.enums.ApplicationStatus;

public record AllocationHistoryDto(
                Long id,
                UserDto student,
                ApplicationStatus applicationStatus,
                int numberOfHours,
                SectionDtoNoCourse section) {

}