package com.infinity.applicationservice.utility;

import com.infinity.applicationservice.dtos.*;
import com.infinity.applicationservice.models.Application;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ApplicationMapper {

    public ApplicationDto toDto(Application application) {
        return new ApplicationDto(
            application.getStudentId(),
            application.getSubjectPreferences(),
            application.isWantRemote(),
            application.getWantWorkingHours(),
            application.getSubmittedAt(),
            application.getAvailabilities().stream()
                .map(a -> new AvailabilityDto(
                    a.getDay(),
                    a.getStartTime().toString(),
                    a.getEndTime().toString()))
                .collect(Collectors.toSet())
        );
    }
}
