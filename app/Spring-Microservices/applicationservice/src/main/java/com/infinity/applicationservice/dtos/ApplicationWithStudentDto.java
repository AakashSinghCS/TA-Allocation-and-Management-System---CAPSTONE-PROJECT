package com.infinity.applicationservice.dtos;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.infinity.applicationservice.enums.ApplicationType;
import com.infinity.applicationservice.enums.Subject;

public record ApplicationWithStudentDto(Long applicationId,
                StudentDto student,
                List<Subject> preferences,
        ApplicationType applicationType,
                boolean wantRemote,
                Integer wantWorkingHours,
                LocalDateTime timeSubmitted,
                Set<AvailabilityDto> availabilities) {
}
