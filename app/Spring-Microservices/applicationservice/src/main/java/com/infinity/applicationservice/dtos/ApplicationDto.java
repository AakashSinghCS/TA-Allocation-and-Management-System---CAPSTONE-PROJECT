package com.infinity.applicationservice.dtos;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.infinity.applicationservice.enums.Subject;

public record ApplicationDto(Long studentId,
        List<Subject> preferences,
        boolean wantRemote,
        Integer wantWorkingHours,
        LocalDateTime timeSubmitted,
        Set<AvailabilityDto> availabilities) {

}
