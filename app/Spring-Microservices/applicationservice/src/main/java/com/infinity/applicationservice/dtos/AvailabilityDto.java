package com.infinity.applicationservice.dtos;

import com.infinity.applicationservice.enums.Day;

public record AvailabilityDto(
        Day day,
        String startTime,
        String endTime) {
}
