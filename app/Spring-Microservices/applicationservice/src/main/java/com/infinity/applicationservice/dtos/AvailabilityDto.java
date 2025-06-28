package com.infinity.applicationservice.dtos;

import java.time.LocalDateTime;

import com.infinity.applicationservice.enums.Day;

public record AvailabilityDto(
        Day day,
        LocalDateTime startTime,
        LocalDateTime endTime) {
}
