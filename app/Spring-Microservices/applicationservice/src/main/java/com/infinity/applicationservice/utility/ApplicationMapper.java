package com.infinity.applicationservice.utility;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Applications.ApplicationWithStudentDto;
import com.infinity.applicationservice.dtos.Applications.UnavailabilityDto;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.Subject;
import com.infinity.applicationservice.models.Application;

@Component
public class ApplicationMapper {

    public ApplicationDto toDto(Application application) {
        return new ApplicationDto(
            application.getId(),
            application.getStudentId(),
            filterPreferences(application),
            application.getApplicationType(),
            application.isWantRemote(),
            application.getWantWorkingHours(),
            application.getSubmittedAt(),
            application.getUnavailabilities().stream()
                .map(a -> new UnavailabilityDto(
                    a.getDay(),
                    a.getStartTime().toString(),
                    a.getEndTime().toString()))
                .collect(Collectors.toSet())
        );
    }

    public ApplicationWithStudentDto toDtoWithStudent(Application app, UserDto student) {
        return new ApplicationWithStudentDto(
                app.getId(),
                student,
                filterPreferences(app),
                app.getApplicationType(),
                app.isWantRemote(),
                app.getWantWorkingHours(),
                app.getSubmittedAt(),
                app.getUnavailabilities().stream()
                        .map(a -> new UnavailabilityDto(a.getDay(), a.getStartTime().toString(),
                                a.getEndTime().toString()))
                        .collect(Collectors.toSet()));
    }
    
    private List<Subject> filterPreferences(Application application) {
        return Arrays.asList(
                application.getSubjectPreference1(),
                application.getSubjectPreference2(),
                application.getSubjectPreference3()).stream()
                .filter(s -> s != null)
                .toList();
    }
}
