package com.infinity.applicationservice.services;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Applications.ApplicationRequest;
import com.infinity.applicationservice.dtos.Applications.ApplicationWithStudentDto;
import com.infinity.applicationservice.dtos.Applications.AvailabilityDto;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.Subject;
import com.infinity.applicationservice.exceptions.AuthorizationException;
import com.infinity.applicationservice.exceptions.BadRequestException;
import com.infinity.applicationservice.exceptions.NotFoundException;
import com.infinity.applicationservice.feign.CourseInterface;
import com.infinity.applicationservice.feign.NotificationClient;
import com.infinity.applicationservice.feign.UserInterface;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.models.Availability;
import com.infinity.applicationservice.repositories.ApplicationRepository;
import com.infinity.applicationservice.utility.ApplicationMapper;
import com.infinity.applicationservice.utility.EmailMapper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserInterface userInterface;
    private final ApplicationMapper applicationMapper;
    private final ConfigService configService;
    private final NotificationClient notificationClient;
    private final EmailMapper emailMapper;
    private final CourseInterface courseInterface;

    public ApplicationDto submitApplication(ApplicationRequest req, Long userIdFromHeader, List<String> headerRoles) {

        if (applicationRepository.existsByStudentIdAndYearAndSemester(userIdFromHeader, req.year(), req.semester())) {
            throw new BadRequestException("You have already submitted an application for this year and semester.");
        }
        courseInterface.getSemesterByYearAndSemester(req.year(), req.semester());

        if (LocalDateTime.now().isAfter(configService.getDeadlineByName("student_application_deadline").endTime())) {
            throw new BadRequestException("The application deadline has passed.");
        }
        if (LocalDateTime.now().isBefore(configService.getDeadlineByName("student_application_deadline").startTime())) {
            throw new BadRequestException("The application is not open yet.");
        }

        validateAvailabilities(req);
        Application application = new Application(userIdFromHeader, req.preferences(), req.applicationType(),
                req.wantRemote(), req.wantWorkingHours(), req.year(), req.semester());

        mapAvailability(req, application);

        applicationRepository.save(application);

        UserDto student = userInterface.getStudentById(userIdFromHeader).getBody();
        notificationClient.sendEmail(emailMapper.applicationReceivedEmailRequest(student));

        return applicationMapper.toDto(application);
    }

    public ApplicationDto getApplication(Long studentId, Integer year, String semester, Long userIdFromHeader,
            List<String> headerRoles) {
        if (!studentId.equals(userIdFromHeader) && !headerRoles.contains("ROLE_COORDINATOR")) {
            throw new AuthorizationException("Not allowed");
        }
        Application application = applicationRepository.findByStudentIdAndYearAndSemester(studentId, year, semester)
                .orElseThrow(() -> new NotFoundException(
                        "Application with that student id, year, and semester doesn't exist"));

        return applicationMapper.toDto(application);
    }

    @Transactional
    public String deleteApplication(Long studentId, Integer year, String semester, Long userIdFromHeader,
            List<String> headerRoles) {
        if (!studentId.equals(userIdFromHeader) && !headerRoles.contains("ROLE_COORDINATOR")) {
            throw new AuthorizationException("Not allowed");
        }
        if (!applicationRepository.existsByStudentIdAndYearAndSemester(studentId, year, semester)) {
            throw new NotFoundException("Application with that student id and year doesn't exist");
        }
        applicationRepository.deleteByStudentIdAndYearAndSemester(studentId, year, semester);
        return "Application deleted";
    }

    @Transactional
    public ApplicationDto updateApplication(ApplicationRequest req, Long studentId, Integer year, String semester,
            Long userIdFromHeader,
            List<String> headerRoles) {
        if (!studentId.equals(userIdFromHeader) && !headerRoles.contains("ROLE_COORDINATOR")) {
            throw new AuthorizationException("Not allowed");
        }
        if (LocalDateTime.now().isAfter(configService.getDeadlineByName("student_application_deadline").endTime())) {
            throw new BadRequestException("The application deadline has passed.");
        }
        if (LocalDateTime.now().isBefore(configService.getDeadlineByName("student_application_deadline").startTime())) {
            throw new BadRequestException("The application is not open yet.");
        }
        courseInterface.getSemesterByYearAndSemester(req.year(), req.semester());
        validateAvailabilities(req);

        Application application = applicationRepository
                .findByStudentIdAndYearAndSemester(studentId, year, semester)
                .orElseThrow(() -> new NotFoundException(
                        "Application with that student id, year, and semester doesn't exist"));

        application.setSubjectPreferences(req);
        application.setApplicationType(req.applicationType());
        application.setWantRemote(req.wantRemote());
        application.setWantWorkingHours(req.wantWorkingHours());
        application.setYear(req.year());
        application.setSemester(req.semester());

        application.getAvailabilities().clear();
        mapAvailability(req, application);

        applicationRepository.save(application);
        return applicationMapper.toDto(application);
    }

    public List<ApplicationDto> getAllApplicationsByStudentId(Long studentId, Long userIdFromHeader,
            List<String> headerRoles) {
        if (!studentId.equals(userIdFromHeader) && !headerRoles.contains("ROLE_COORDINATOR")) {
            throw new AuthorizationException("Not allowed");
        }
        List<Application> applications = applicationRepository.findAllByStudentId(studentId)
                .orElseThrow(() -> new NotFoundException("No applications exist for this user"));
        return applications.stream()
                .map(applicationMapper::toDto)
                .toList();
    }

    private void validateAvailabilities(ApplicationRequest req) {
        if (req.availabilities() != null) {
            for (AvailabilityDto a : req.availabilities()) {
                if (a.startTime() == null || a.endTime() == null || a.day() == null) {
                    throw new BadRequestException("Availability entries must include day, startTime, and endTime.");
                }
                if (!LocalTime.parse(a.startTime()).isBefore(LocalTime.parse(a.endTime()))) {
                    throw new BadRequestException(
                            "Start time must be before end time for availability on " + a.day());
                }
            }
        }
    }

    private void mapAvailability(ApplicationRequest req, Application application) {
        if (req.availabilities() != null) {
            Set<Availability> availabilities = req.availabilities().stream()
                    .map(a -> {
                        Availability availability = new Availability();
                        availability.setDay(a.day());
                        availability.setStartTime(LocalTime.parse(a.startTime()));
                        availability.setEndTime(LocalTime.parse(a.endTime()));
                        availability.setApplication(application);
                        return availability;
                    }).collect(Collectors.toSet());

            application.getAvailabilities().addAll(availabilities);
        }

    }

    public List<ApplicationWithStudentDto> getAllApplications(Integer year, String semester, Boolean wantRemote,
            Integer hours,
            Subject preference1, Subject preference2, Subject preference3) {

        List<Application> applications = applicationRepository.findByFilters(year, semester, wantRemote, hours,
                preference1, preference2, preference3);

        return applications.stream()
                .map(app -> applicationMapper.toDtoWithStudent(app,
                        userInterface.getStudentById(app.getStudentId()).getBody()))
                .toList();
    }

    public Page<ApplicationWithStudentDto> getAllApplications(
            Integer year,
            String semester,
            Boolean wantRemote,
            Integer hours,
            Subject pref1,
            Subject pref2,
            Subject pref3,
            Pageable pageable) {

        Page<Application> page = applicationRepository
                .findByFilters(year, semester, wantRemote, hours, pref1, pref2, pref3, pageable);

        return page.map(app -> applicationMapper.toDtoWithStudent(
                app,
                userInterface.getStudentById(app.getStudentId()).getBody()));
    }

    public List<Integer> getAllApplicationYears() {
        return applicationRepository.findDistinctYears();
    }

    public List<String> getAllApplicationSemesters() {
        return applicationRepository.findDistinctSemesters();
    }
}
