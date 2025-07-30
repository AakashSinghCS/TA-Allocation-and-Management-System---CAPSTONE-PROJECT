package com.infinity.applicationservice.dtos.Applications;


import com.infinity.applicationservice.enums.Day;

public record UnavailabilityDto(
        Day day,
        String startTime,
        String endTime) {
}
