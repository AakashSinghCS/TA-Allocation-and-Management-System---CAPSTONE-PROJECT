package com.infinity.applicationservice.dtos.Applications;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.ApplicationType;
import com.infinity.applicationservice.enums.Subject;

public record ApplicationWithStudentDto(Long applicationId,
                UserDto student,
                List<Subject> preferences,
        ApplicationType applicationType,
                boolean wantRemote,
                Integer wantWorkingHours,
                LocalDateTime timeSubmitted,
                Set<UnavailabilityDto> unavailabilities) {
}
