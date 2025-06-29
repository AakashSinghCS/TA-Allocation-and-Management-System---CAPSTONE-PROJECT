package com.infinity.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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

import com.infinity.applicationservice.dtos.ApplicationDto;
import com.infinity.applicationservice.dtos.ApplicationRequest;
import com.infinity.applicationservice.dtos.AvailabilityDto;
import com.infinity.applicationservice.enums.Day;
import com.infinity.applicationservice.enums.Subject;
import com.infinity.applicationservice.exceptions.AuthorizationException;
import com.infinity.applicationservice.exceptions.BadRequestException;
import com.infinity.applicationservice.exceptions.NotFoundException;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.repositories.ApplicationRepository;
import com.infinity.applicationservice.services.ApplicationService;

@ExtendWith(MockitoExtension.class)
public class ApplicationServiceTest {

    @Mock
    ApplicationRepository applicationRepository;

    @InjectMocks
    ApplicationService applicationService;

    static Set<AvailabilityDto> availabilities;

    @BeforeAll
    static void setUp() {
        availabilities = new HashSet<>();
        availabilities.add(new AvailabilityDto(Day.MONDAY,"09:00","10:00"));
    }
    

    @Test
    void testSubmitApplication_AlreadySubmitted_BadRequest() {
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC), false, 6, availabilities);

        when(applicationRepository.existsByStudentIdAndYear(1L, 2025)).thenReturn(true);

        BadRequestException e = assertThrows(BadRequestException.class, () -> {
            applicationService.submitApplication(applicationRequest, 1L, List.of("ROLE_STUDENT"));
        });
        assertEquals("You have already submitted an application for this year.", e.getMessage());
    }

    @Test
    void testSubmitApplication_MissingAvailabilityFields_BadRequest() {
        Set<AvailabilityDto> badAvailabilities = new HashSet<>();
        badAvailabilities.add(new AvailabilityDto(null, "10:00","9:00"));
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC), false, 6,
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
        badAvailabilities.add(new AvailabilityDto(Day.MONDAY, "10:00","09:00"));
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC), false, 6,
                badAvailabilities);

        when(applicationRepository.existsByStudentIdAndYear(1L, 2025)).thenReturn(false);

        BadRequestException e = assertThrows(BadRequestException.class, () -> {
            applicationService.submitApplication(applicationRequest, 1L, List.of("ROLE_STUDENT"));
        });
        assertEquals("Start time must be before end time for availability on MONDAY", e.getMessage());
    }
    
    @Test
    void testSubmitApplication_Success() {
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC), false, 6, availabilities);

        when(applicationRepository.existsByStudentIdAndYear(1L, 2025)).thenReturn(false);
        when(applicationRepository.save(Mockito.any(Application.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        ApplicationDto applicationDto = applicationService.submitApplication(applicationRequest, 1L,
                List.of("ROLE_STUDENT"));
        assertEquals(applicationDto.studentId(), 1L);
        assertFalse(applicationDto.wantRemote());
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
        Application application = new Application(1L, List.of(Subject.COSC), false, 6);

        when(applicationRepository.findByStudentIdAndYear(1L, 2025)).thenReturn(Optional.of(application));

        ApplicationDto applicationDto = applicationService.getApplication(1L, 2025, 1L,
                List.of("ROLE_STUDENT"));
        assertEquals(applicationDto.studentId(), 1L);
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
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC), false, 6, availabilities);
        AuthorizationException e = assertThrows(AuthorizationException.class, () -> {
            applicationService.updateApplication(applicationRequest, 2L, 1L,
                    List.of("ROLE_STUDENT"));
        });
        assertEquals("Not allowed", e.getMessage());
    }
    
    @Test
    void testUpdateApplication_NotFound() {
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC), false, 6, availabilities);
        when(applicationRepository.findByStudentIdAndYear(1L, 2025)).thenReturn(Optional.empty());
        NotFoundException e = assertThrows(NotFoundException.class, () -> {
            applicationService.updateApplication(applicationRequest, 1L, 1L,
                    List.of("ROLE_STUDENT"));
        });
        assertEquals("Application with that student id and year doesn't exist", e.getMessage());
    }
    
    @Test
    void testUpdateApplication_Success() {
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC), false, 6, availabilities);
        Application application = new Application(1L, List.of(Subject.DATA, Subject.MATH, Subject.PHYS), true, 12);
        when(applicationRepository.findByStudentIdAndYear(1L, 2025)).thenReturn(Optional.of(application));
        ApplicationDto applicationDto = applicationService.updateApplication(applicationRequest, 1L, 1L,
                List.of("ROLE_STUDENT"));
        verify(applicationRepository).save(application);
        assertFalse(applicationDto.wantRemote());
        assertEquals(applicationDto.preferences().get(0), application.getSubjectPreferences().get(0));
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
        List<Application> applications = List.of(new Application(1L, List.of(Subject.COSC), false, 6), 
                new Application(1L, List.of(Subject.DATA), true, 12));

        when(applicationRepository.findAllByStudentId(1L)).thenReturn(Optional.of(applications));

        List<ApplicationDto> applicationDtos = applicationService.getAllApplicationsByStudentId(1L, 1L,
                List.of("ROLE_STUDENT"));
        assertEquals(applicationDtos.get(0).studentId(), 1L);
        assertEquals(applicationDtos.get(1).studentId(), 1L);
        assertFalse(applicationDtos.get(0).wantRemote());
        assertTrue(applicationDtos.get(1).wantRemote());
        assertEquals(applicationDtos.get(0).wantWorkingHours(), 6);
        assertEquals(applicationDtos.get(1).wantWorkingHours(), 12);
    }
    
}
