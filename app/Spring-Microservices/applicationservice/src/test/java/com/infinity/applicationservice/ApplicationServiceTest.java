package com.infinity.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Applications.ApplicationRequest;
import com.infinity.applicationservice.dtos.Applications.ApplicationWithStudentDto;
import com.infinity.applicationservice.dtos.Applications.AvailabilityDto;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.ApplicationType;
import com.infinity.applicationservice.enums.Day;
import com.infinity.applicationservice.enums.Subject;
import com.infinity.applicationservice.enums.UserRole;
import com.infinity.applicationservice.exceptions.AuthorizationException;
import com.infinity.applicationservice.exceptions.BadRequestException;
import com.infinity.applicationservice.exceptions.NotFoundException;
import com.infinity.applicationservice.feign.NotificationClient;
import com.infinity.applicationservice.feign.UserInterface;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.repositories.ApplicationRepository;
import com.infinity.applicationservice.services.ApplicationService;
import com.infinity.applicationservice.utility.ApplicationMapper;
import com.infinity.applicationservice.utility.EmailMapper;

@ExtendWith(MockitoExtension.class)
public class ApplicationServiceTest {

    @Mock
    ApplicationRepository applicationRepository;

    @Mock
    UserInterface userInterface;

    @Mock
    ApplicationMapper applicationMapper;

    @Mock
    NotificationClient notificationClient;

    @Mock
    EmailMapper emailMapper;

    @InjectMocks
    ApplicationService applicationService;

    static Set<AvailabilityDto> availabilities;

    @BeforeAll
    static void setUp() {
        availabilities = new HashSet<>();
        availabilities.add(new AvailabilityDto(Day.MONDAY, "09:00", "10:00"));
    }

    @Test
    void testSubmitApplication_AlreadySubmitted_BadRequest() {
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE, false, 6, availabilities);

        when(applicationRepository.existsByStudentIdAndYear(1L, 2025)).thenReturn(true);

        BadRequestException e = assertThrows(BadRequestException.class, () -> {
            applicationService.submitApplication(applicationRequest, 1L, List.of("ROLE_STUDENT"));
        });
        assertEquals("You have already submitted an application for this year.", e.getMessage());
    }

    @Test
    void testSubmitApplication_MissingAvailabilityFields_BadRequest() {
        Set<AvailabilityDto> badAvailabilities = new HashSet<>();
        badAvailabilities.add(new AvailabilityDto(null, "10:00", "9:00"));
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE, false, 6,
                badAvailabilities);

        when(applicationRepository.existsByStudentIdAndYear(1L, 2025)).thenReturn(false);

        BadRequestException e = assertThrows(BadRequestException.class, () -> {
            applicationService.submitApplication(applicationRequest, 1L, List.of("ROLE_STUDENT"));
        });
        assertEquals("Availability entries must include day, startTime, and endTime.", e.getMessage());
    }

    @Test
    void testSubmitApplication_BadAvailability_BadRequest() {
        Set<AvailabilityDto> badAvailabilities = new HashSet<>();
        badAvailabilities.add(new AvailabilityDto(Day.MONDAY, "10:00", "09:00"));
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE, false, 6,
                badAvailabilities);

        when(applicationRepository.existsByStudentIdAndYear(1L, 2025)).thenReturn(false);

        BadRequestException e = assertThrows(BadRequestException.class, () -> {
            applicationService.submitApplication(applicationRequest, 1L, List.of("ROLE_STUDENT"));
        });
        assertEquals("Start time must be before end time for availability on MONDAY", e.getMessage());
    }

    @Test
    void testSubmitApplication_Success() {
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE, false, 6, availabilities);

        when(applicationRepository.existsByStudentIdAndYear(1L, 2025)).thenReturn(false);
        when(applicationRepository.save(Mockito.any(Application.class)))
                .thenAnswer(invocation -> {
                    Application saved = invocation.getArgument(0);
                    saved.setSubjectPreference1(Subject.COSC);
                    saved.setWantRemote(false);
                    saved.setWantWorkingHours(6);
                    saved.setSubmittedAt(LocalDate.now().atStartOfDay());
                    return saved;
                });

        ApplicationDto mockedDto = new ApplicationDto(
                1L,
                1L,
                List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE,
                false,
                6,
                LocalDate.now().atStartOfDay(),
                Set.of());

        UserDto studentDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                12345678, "COSC", 2025, 3, null, null, null);
        when(applicationMapper.toDto(Mockito.any(Application.class))).thenReturn(mockedDto);
        when(userInterface.getStudentById(1L)).thenReturn(ResponseEntity.ok(studentDto));
        when(notificationClient.sendEmail(any())).thenReturn(null);

        ApplicationDto applicationDto = applicationService.submitApplication(applicationRequest, 1L,
                List.of("ROLE_STUDENT"));

        assertEquals(1L, applicationDto.studentId());
        assertFalse(applicationDto.wantRemote());

        verify(applicationRepository).save(Mockito.any(Application.class));
        verify(applicationMapper).toDto(Mockito.any(Application.class));
    }

    @Test
    void testGetApplication_Forbidden() {
        AuthorizationException e = assertThrows(AuthorizationException.class, () -> {
            applicationService.getApplication(2L, 2025, 1L,
                    List.of("ROLE_STUDENT"));
        });
        assertEquals("Not allowed", e.getMessage());
    }

    @Test
    void testGetApplication_NotFound() {
        when(applicationRepository.findByStudentIdAndYear(1L, 2025)).thenReturn(Optional.empty());

        NotFoundException e = assertThrows(NotFoundException.class, () -> {
            applicationService.getApplication(1L, 2025, 1L,
                    List.of("ROLE_STUDENT"));
        });
        assertEquals("Application with that student id and year doesn't exist", e.getMessage());
    }

    @Test
    void testGetApplication_Success() {
        Application application = new Application(1L, List.of(Subject.COSC), ApplicationType.UNDERGRADUATE, false, 6);

        when(applicationRepository.findByStudentIdAndYear(1L, 2025)).thenReturn(Optional.of(application));

        ApplicationDto mockedDto = new ApplicationDto(
                1L,
                1L,
                List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE,
                false,
                6,
                application.getSubmittedAt(),
                Set.of());

        when(applicationMapper.toDto(application)).thenReturn(mockedDto);

        ApplicationDto applicationDto = applicationService.getApplication(1L, 2025, 1L,
                List.of("ROLE_STUDENT"));

        assertEquals(1L, applicationDto.studentId());
        assertFalse(applicationDto.wantRemote());
    }

    @Test
    void testDeleteApplication_Forbidden() {
        AuthorizationException e = assertThrows(AuthorizationException.class, () -> {
            applicationService.deleteApplication(2L, 1L,
                    List.of("ROLE_STUDENT"));
        });
        assertEquals("Not allowed", e.getMessage());
    }

    @Test
    void testDeleteApplication_NotFound() {
        when(applicationRepository.existsByStudentIdAndYear(1L, 2025)).thenReturn(false);
        NotFoundException e = assertThrows(NotFoundException.class, () -> {
            applicationService.deleteApplication(1L, 1L,
                    List.of("ROLE_STUDENT"));
        });
        assertEquals("Application with that student id and year doesn't exist", e.getMessage());
    }

    @Test
    void testDeleteApplication_Success() {
        when(applicationRepository.existsByStudentIdAndYear(1L, 2025)).thenReturn(true);
        applicationService.deleteApplication(1L, 1L, List.of("ROLE_STUDENT"));
        verify(applicationRepository).deleteByStudentIdAndYear(1L, 2025);
    }

    @Test
    void testUpdateApplication_Forbidden() {
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE, false, 6, availabilities);
        AuthorizationException e = assertThrows(AuthorizationException.class, () -> {
            applicationService.updateApplication(applicationRequest, 2L, 1L,
                    List.of("ROLE_STUDENT"));
        });
        assertEquals("Not allowed", e.getMessage());
    }

    @Test
    void testUpdateApplication_NotFound() {
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE, false, 6, availabilities);
        when(applicationRepository.findByStudentIdAndYear(1L, 2025)).thenReturn(Optional.empty());
        NotFoundException e = assertThrows(NotFoundException.class, () -> {
            applicationService.updateApplication(applicationRequest, 1L, 1L,
                    List.of("ROLE_STUDENT"));
        });
        assertEquals("Application with that student id and year doesn't exist", e.getMessage());
    }

    @Test
    void testUpdateApplication_Success() {
        ApplicationRequest applicationRequest = new ApplicationRequest(
                List.of(Subject.COSC), ApplicationType.UNDERGRADUATE, false, 6, availabilities);

        Application application = new Application(1L, List.of(Subject.DATA, Subject.MATH, Subject.PHYS),
                ApplicationType.UNDERGRADUATE, true, 12);
        when(applicationRepository.findByStudentIdAndYear(1L, 2025)).thenReturn(Optional.of(application));

        ApplicationDto mockedDto = new ApplicationDto(
                1L,
                1L,
                List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE,
                false,
                6,
                application.getSubmittedAt(),
                Set.of());

        when(applicationMapper.toDto(application)).thenReturn(mockedDto);
        when(applicationRepository.save(application)).thenReturn(application);

        ApplicationDto applicationDto = applicationService.updateApplication(
                applicationRequest, 1L, 1L, List.of("ROLE_STUDENT"));

        verify(applicationRepository).save(application);
        assertFalse(applicationDto.wantRemote());
        assertEquals(Subject.COSC, applicationDto.preferences().get(0));
    }

    @Test
    void testGetAllApplications_Forbidden() {
        AuthorizationException e = assertThrows(AuthorizationException.class, () -> {
            applicationService.getAllApplicationsByStudentId(2L, 1L,
                    List.of("ROLE_STUDENT"));
        });
        assertEquals("Not allowed", e.getMessage());
    }

    @Test
    void testGetAllApplications_NotFound() {
        when(applicationRepository.findAllByStudentId(1L)).thenReturn(Optional.empty());

        NotFoundException e = assertThrows(NotFoundException.class, () -> {
            applicationService.getAllApplicationsByStudentId(1L, 1L,
                    List.of("ROLE_STUDENT"));
        });
        assertEquals("No applications exist for this user", e.getMessage());
    }

    @Test
    void testGetAllApplications_Success() {
        Application app1 = new Application(1L, List.of(Subject.COSC), ApplicationType.UNDERGRADUATE, false, 6);
        Application app2 = new Application(1L, List.of(Subject.DATA), ApplicationType.UNDERGRADUATE, true, 12);

        List<Application> applications = List.of(app1, app2);

        when(applicationRepository.findAllByStudentId(1L)).thenReturn(Optional.of(applications));

        ApplicationDto dto1 = new ApplicationDto(
                1L,
                1L,
                List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE,
                false,
                6,
                app1.getSubmittedAt(),
                Set.of());

        ApplicationDto dto2 = new ApplicationDto(
                1L,
                1L,
                List.of(Subject.DATA),
                ApplicationType.UNDERGRADUATE,
                true,
                12,
                app2.getSubmittedAt(),
                Set.of());

        when(applicationMapper.toDto(app1)).thenReturn(dto1);
        when(applicationMapper.toDto(app2)).thenReturn(dto2);

        List<ApplicationDto> applicationDtos = applicationService.getAllApplicationsByStudentId(1L, 1L,
                List.of("ROLE_STUDENT"));

        assertEquals(1L, applicationDtos.get(0).studentId());
        assertEquals(1L, applicationDtos.get(1).studentId());
        assertFalse(applicationDtos.get(0).wantRemote());
        assertTrue(applicationDtos.get(1).wantRemote());
        assertEquals(6, applicationDtos.get(0).wantWorkingHours());
        assertEquals(12, applicationDtos.get(1).wantWorkingHours());
    }

    @Test
    void testGetAllApplicationsWithStudentData() {
        Application app = new Application(1L, List.of(Subject.COSC, Subject.MATH), ApplicationType.UNDERGRADUATE, false, 6);
        app.setSubmittedAt(LocalDateTime.of(2024, 1, 1, 12, 0));

        UserDto studentDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                                12345678, "COSC", 2025, 3, null, null, null);

        ApplicationWithStudentDto expectedDto = new ApplicationWithStudentDto(
                1L,
                studentDto,
                List.of(Subject.COSC, Subject.MATH),
                ApplicationType.UNDERGRADUATE,
                false,
                6,
                LocalDateTime.of(2024, 1, 1, 12, 0),
                Set.of());

        when(applicationRepository.findByFilters(2024, false, 6, Subject.COSC, null, null))
                .thenReturn(List.of(app));
        when(userInterface.getStudentById(1L)).thenReturn(ResponseEntity.ok(studentDto));
        when(applicationMapper.toDtoWithStudent(app, studentDto)).thenReturn(expectedDto);

        List<ApplicationWithStudentDto> result = applicationService.getAllApplications(
                2024, false, 6, Subject.COSC, null, null);

        assertEquals(1, result.size());
        ApplicationWithStudentDto dto = result.get(0);

        assertEquals(studentDto, dto.student());
        assertEquals(false, dto.wantRemote());
        assertEquals(6, dto.wantWorkingHours());
        assertTrue(dto.preferences().contains(Subject.COSC));
    }

}
