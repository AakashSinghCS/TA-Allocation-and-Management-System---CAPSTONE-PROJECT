package com.infinity.courseservice.dtos.ApplicationDtos;


import com.infinity.courseservice.enums.Day;

public record AvailabilityDto(
        Day day,
        String startTime,
        String endTime) {
}
