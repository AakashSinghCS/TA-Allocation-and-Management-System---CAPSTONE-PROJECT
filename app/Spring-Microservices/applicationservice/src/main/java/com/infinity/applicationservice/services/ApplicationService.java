package com.infinity.applicationservice.services;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;

import com.infinity.applicationservice.dtos.ApplicationDto;
import com.infinity.applicationservice.dtos.ApplicationRequest;
import com.infinity.applicationservice.enums.Subject;
import com.infinity.applicationservice.exceptions.AuthorizationException;
import com.infinity.applicationservice.exceptions.BadRequestException;
import com.infinity.applicationservice.exceptions.NotFoundException;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.repositories.ApplicationRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    public ApplicationDto submitApplication(ApplicationRequest req, Long userIdFromHeader, List<String> headerRoles) {
        int year = LocalDate.now().getYear();

        if (applicationRepository.existsByStudentIdAndYear(userIdFromHeader, year)) {
            throw new BadRequestException("You have already submitted an application for this year.");
        }
        Application application = new Application(userIdFromHeader, req.preferences(), req.wantRemote(),
                req.wantWorkingHours());
        application = applicationRepository.save(application);
        List<Subject> preferences = filterPreferences(application);
        return new ApplicationDto(application.getStudentId(), preferences, application.isWantRemote(),
                application.getWantWorkingHours(), application.getSubmittedAt());
    }

    public ApplicationDto getApplication(Long studentId, Integer year, Long userIdFromHeader,
            List<String> headerRoles) {
        if (!studentId.equals(userIdFromHeader) && !headerRoles.contains("ROLE_COORDINATOR")) {
            throw new AuthorizationException("Not allowed");
        }
        Application application = applicationRepository.findByStudentIdAndYear(studentId, year)
                .orElseThrow(() -> new NotFoundException("Application with that student id and year doesn't exist"));
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
            throw new NotFoundException("Application with that student id and year doesn't exist");
        }
        applicationRepository.deleteByStudentIdAndYear(studentId, LocalDate.now().getYear());
        return "Application deleted";
    }

    @Transactional
    public ApplicationDto updateApplication(ApplicationRequest req, Long studentId, Long userIdFromHeader,
            List<String> headerRoles) {
        if (!studentId.equals(userIdFromHeader) && !headerRoles.contains("ROLE_COORDINATOR")) {
            throw new AuthorizationException("Not allowed");
        }
        int year = LocalDate.now().getYear();

        Application application = applicationRepository
                .findByStudentIdAndYear(studentId, year)
                .orElseThrow(() -> new NotFoundException("Application with that student id and year doesn't exist"));
        application.setSubjectPreferences(req);
        application.setWantRemote(req.wantRemote());
        application.setWantWorkingHours(req.wantWorkingHours());
        applicationRepository.save(application);
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

    public List<ApplicationDto> getAllApplicationsByStudentId(Long studentId, Long userIdFromHeader,
            List<String> headerRoles) {
        if (!studentId.equals(userIdFromHeader) && !headerRoles.contains("ROLE_COORDINATOR")) {
            throw new AuthorizationException("Not allowed");
        }
        List<Application> applications = applicationRepository.findAllByStudentId(studentId)
                .orElseThrow(() -> new NotFoundException("No applications exist for this user"));
        return applications.stream()
                .map(app -> {
                    List<Subject> preferences = filterPreferences(app);
                    return new ApplicationDto(
                            app.getStudentId(),
                            preferences,
                            app.isWantRemote(),
                            app.getWantWorkingHours(),
                            app.getSubmittedAt());
                })
                .toList();
    }
}
