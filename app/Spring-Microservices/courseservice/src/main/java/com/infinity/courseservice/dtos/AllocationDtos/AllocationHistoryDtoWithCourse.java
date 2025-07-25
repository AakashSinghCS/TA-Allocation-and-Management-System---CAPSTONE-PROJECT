package com.infinity.courseservice.dtos.AllocationDtos;

import com.infinity.courseservice.dtos.ApplicationDtos.ApplicationDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.enums.ApplicationStatus;

public record AllocationHistoryDtoWithCourse(
        Long id,
        UserDto student,
        ApplicationDto applicationDto,
        ApplicationStatus status,
        int numberOfHours,
        SectionDto section) {

}