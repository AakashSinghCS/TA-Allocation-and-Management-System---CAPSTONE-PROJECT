package com.infinity.applicationservice.services;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.applicationservice.dtos.ApplicationDto;
import com.infinity.applicationservice.dtos.ApplicationRequest;
import com.infinity.applicationservice.enums.Subject;
import com.infinity.applicationservice.exceptions.AuthorizationException;
import com.infinity.applicationservice.exceptions.NotFoundException;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.repositories.ApplicationRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    
    private final ApplicationRepository applicationRepository;
    //private final UserInterface userInterface;

    public ApplicationDto apply(ApplicationRequest req, Long userIdFromHeader, List<String> headerRoles) {
        Application application = new Application(userIdFromHeader, req.preferences(), req.wantRemote(),
                req.wantWorkingHours());
        application = applicationRepository.save(application);
        List<Subject> preferences = filterPreferences(application);
        return new ApplicationDto(application.getStudentId(), preferences, application.isWantRemote(),
                application.getWantWorkingHours(), application.getSubmittedAt());
    }

    public ApplicationDto getApplication(Long studentId, Integer year, Long userIdFromHeader, List<String> headerRoles) {
        if (!studentId.equals(userIdFromHeader) && !headerRoles.contains("ROLE_COORDINATOR")) {
            throw new AuthorizationException("Not allowed");
        }
        if (!applicationRepository.existsByStudentIdAndYear(studentId, year)) {
            throw new NotFoundException("Application with that student id and year doesn't exist");
        }
        Application application = applicationRepository.getByStudentIdAndYear(studentId, year);
        List<Subject> preferences = filterPreferences(application);
        return new ApplicationDto(application.getStudentId(), preferences, application.isWantRemote(),
                application.getWantWorkingHours(), application.getSubmittedAt());
    }

    @Transactional
    public String deleteApplication(Long studentId, Long userIdFromHeader, List<String> headerRoles) {
        if (!studentId.equals(userIdFromHeader) && !headerRoles.contains("ROLE_COORDINATOR")) {
            throw new AuthorizationException("Not allowed");
        }
        if (!applicationRepository.existsByStudentIdAndYear(studentId, LocalDate.now().getYear())) {
            throw new NotFoundException("Application with student id " + studentId + " doesn't exist");
        }
        applicationRepository.existsByStudentIdAndYear(studentId, LocalDate.now().getYear());
        return "Application deleted";
    }

    public ApplicationDto updateApplication(Long studentId, Long userIdFromHeader, List<String> headerRoles) {
        if (!studentId.equals(userIdFromHeader) && !headerRoles.contains("ROLE_COORDINATOR")) {
            throw new AuthorizationException("Not allowed");
        }
        if (!applicationRepository.existsByStudentIdAndYear(studentId, LocalDate.now().getYear())) {
            throw new NotFoundException("Application with student id " + studentId + " doesn't exist");
        }
        Application application = applicationRepository.getByStudentIdAndYear(studentId, LocalDate.now().getYear());
        List<Subject> preferences = filterPreferences(application);
        return new ApplicationDto(application.getStudentId(), preferences, application.isWantRemote(),
                application.getWantWorkingHours(), application.getSubmittedAt());
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
