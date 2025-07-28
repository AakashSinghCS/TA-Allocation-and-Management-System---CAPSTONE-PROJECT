package com.infinity.courseservice.dtos.ApplicationDtos;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.infinity.courseservice.enums.ApplicationType;
import com.infinity.courseservice.enums.Subject;

public record ApplicationDto(
                Long applicationId,
                Long studentId,
                List<Subject> preferences,
                ApplicationType applicationType,
                boolean wantRemote,
                Integer wantWorkingHours,
                LocalDateTime timeSubmitted,
                Set<AvailabilityDto> availabilities) {

}
