package com.infinity.applicationservice.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.applicationservice.dtos.ApplicationDto;
import com.infinity.applicationservice.dtos.ApplicationRequest;
import com.infinity.applicationservice.enums.Subject;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.repositories.ApplicationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    
    private final ApplicationRepository applicationRepository;
    //private final UserInterface userInterface;

    public ApplicationDto apply(ApplicationRequest req, Long userIdFromHeader, List<String> headerRoles) {
        Application application = new Application(userIdFromHeader, req.preferences(), req.wantRemote(), req.wantWorkingHours());
        application = applicationRepository.save(application);
        List<Subject> preferences = List.of(application.getSubjectPreference1(),
                 application.getSubjectPreference2(), application.getSubjectPreference3());
        return new ApplicationDto(application.getStudentId(), preferences, application.isWantRemote(), 
                application.getWantWorkingHours(), application.getSubmittedAt());
    }
}
