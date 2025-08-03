package com.infinity.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;

import com.infinity.applicationservice.dtos.DeadlineDto;
import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Applications.ApplicationRequest;
import com.infinity.applicationservice.dtos.Applications.ApplicationWithStudentDto;
import com.infinity.applicationservice.dtos.Applications.UnavailabilityDto;
import com.infinity.applicationservice.dtos.Semesters.SemesterDto;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.ActionOptions;
import com.infinity.applicationservice.enums.ApplicationType;
import com.infinity.applicationservice.enums.Day;
import com.infinity.applicationservice.enums.Subject;
import com.infinity.applicationservice.enums.UserRole;
import com.infinity.applicationservice.exceptions.AuthorizationException;
import com.infinity.applicationservice.exceptions.BadRequestException;
import com.infinity.applicationservice.exceptions.NotFoundException;
import com.infinity.applicationservice.feign.CourseInterface;
import com.infinity.applicationservice.feign.NotificationClient;
import com.infinity.applicationservice.feign.UserInterface;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.models.Unavailability;
import com.infinity.applicationservice.models.GlobalDeadline;
import com.infinity.applicationservice.repositories.ApplicationRepository;
import com.infinity.applicationservice.repositories.ConfigRepository;
import com.infinity.applicationservice.services.ApplicationService;
import com.infinity.applicationservice.services.AuditService;
import com.infinity.applicationservice.services.ConfigService;
import com.infinity.applicationservice.utility.ApplicationMapper;
import com.infinity.applicationservice.utility.EmailMapper;

@ExtendWith(MockitoExtension.class)
public class ApplicationServiceTest {

        // private final ApplicationMapper realApplicationMapper = new
        // ApplicationMapper();

        @Mock
        ApplicationRepository applicationRepository;

        @Mock
        ConfigRepository configRepository;

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

    @Mock
    ConfigService configService;

    @Mock
CourseInterface courseInterface;

@Mock
        AuditService auditService;

    static Set<UnavailabilityDto> unavailabilities;

    @BeforeAll
    static void setUp() {
        unavailabilities = new HashSet<>();
        unavailabilities.add(new UnavailabilityDto(Day.MONDAY, "09:00", "10:00"));
    }

        @BeforeEach
        void mockDeadline() {
                DeadlineDto dto = new DeadlineDto(
                                "student_application_deadline",
                                LocalDateTime.now().minusDays(1),
                                LocalDateTime.now().plusDays(1));

                lenient().when(configService.getDeadlineByName(anyString()))
                                .thenReturn(dto);
        }

    @Test
    void testSubmitApplication_AlreadySubmitted_BadRequest() {
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE, false, 6, 2025, "W1", unavailabilities);

        when(applicationRepository.existsByStudentIdAndYearAndSemester(1L, 2025, "W1")).thenReturn(true);

        BadRequestException e = assertThrows(BadRequestException.class, () -> {
            applicationService.submitApplication(applicationRequest, 1L, List.of("ROLE_STUDENT"));
        });
        assertEquals("You have already submitted an application for this year and semester.", e.getMessage());
    }

    @Test
    void testSubmitApplication_DeadlinePassed_BadRequest() {
        // Arrange
        ApplicationRequest applicationRequest = new ApplicationRequest(
            List.of(Subject.COSC),
            ApplicationType.UNDERGRADUATE,
            false,
            6,
            2025, "W1",
                                unavailabilities
        );

        // Mock repository: no previous submission
        when(applicationRepository.existsByStudentIdAndYearAndSemester(anyLong(), anyInt(), any()))
            .thenReturn(false);

                // Mock deadline that already expired
                DeadlineDto expiredDeadline = new DeadlineDto(
                                "student_application_deadline",
                                LocalDateTime.now().minusDays(2),
                                LocalDateTime.now().minusDays(1));

                // Mock configService
                when(configService.getDeadlineByName(anyString()))
                                .thenReturn(expiredDeadline);

                // Act + Assert
                BadRequestException e = assertThrows(BadRequestException.class, () -> {
                        applicationService.submitApplication(applicationRequest, 1L, List.of("ROLE_STUDENT"));
                });

                assertEquals("The application deadline has passed.", e.getMessage());
        }

    @Test
    void testSubmitApplication_MissingUnavailabilityFields_BadRequest() {
        Set<UnavailabilityDto> badUnavailabilities = new HashSet<>();
        badUnavailabilities.add(new UnavailabilityDto(null, "10:00", "9:00"));
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE, false, 6,
                2025, "W1",
                                badUnavailabilities);


        GlobalDeadline testEntity2 = configRepository.findByName("student_application_deadline");
        // System.out.println("REPO RETURN TEST in TEST: " + testEntity2);
        // System.out.println("CONFIG SERVICE CLASS: " + configService.getClass());

        when(applicationRepository.existsByStudentIdAndYearAndSemester(1L, 2025, "W1")).thenReturn(false);
        BadRequestException e = assertThrows(BadRequestException.class, () -> {
            applicationService.submitApplication(applicationRequest, 1L, List.of("ROLE_STUDENT"));
        });
        assertEquals("Unavailability entries must include day, startTime, and endTime.", e.getMessage());
    }

    @Test
    void testSubmitApplication_BadAvailability_BadRequest() {
        Set<UnavailabilityDto> badUnavailabilities = new HashSet<>();
        badUnavailabilities.add(new UnavailabilityDto(Day.MONDAY, "10:00", "09:00"));
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE, false, 6,
                 2025, "W1",
                                badUnavailabilities);

        when(applicationRepository.existsByStudentIdAndYearAndSemester(1L, 2025, "W1")).thenReturn(false);

        BadRequestException e = assertThrows(BadRequestException.class, () -> {
            applicationService.submitApplication(applicationRequest, 1L, List.of("ROLE_STUDENT"));
        });
        assertEquals("Start time must be before end time for unavailability on MONDAY", e.getMessage());
    }

    @Test
    void testSubmitApplication_Success() {
        Long userIdFromHeader = 1L;
        LocalDateTime now = LocalDate.now().atStartOfDay();
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE, false, 6, 2025, "W1", unavailabilities);

        when(applicationRepository.existsByStudentIdAndYearAndSemester(1L, 2025, "W1")).thenReturn(false);
        when(applicationRepository.save(Mockito.any(Application.class)))
                .thenAnswer(invocation -> {
                    Application saved = invocation.getArgument(0);
                    saved.setSubjectPreference1(Subject.COSC);
                    saved.setWantRemote(false);
                    saved.setWantWorkingHours(6);
                    saved.setSubmittedAt(now);
                    return saved;
                });

        Set<Unavailability> unavailabilityEntities = unavailabilities.stream()
                                .map(dto -> {
                                        Unavailability a = new Unavailability();
                                        a.setDay(dto.day());
                                        a.setStartTime(LocalTime.parse(dto.startTime()));
                                        a.setEndTime(LocalTime.parse(dto.endTime()));
                                        return a;
                                })
                                .collect(Collectors.toSet());

                Application mockApp = new Application(
                                1L,
                                1L,
                                List.of(Subject.COSC),
                                ApplicationType.UNDERGRADUATE,
                                false,
                                6,
                                now,
                                unavailabilityEntities);
                mockApp.setSubmittedAt(now);
                mockApp.setSemester("W1");

                ApplicationDto mockedDto = new ApplicationDto(
                                1L,
                                1L,
                                List.of(Subject.COSC),
                                ApplicationType.UNDERGRADUATE,
                                false,
                                6, 2025, "W1",
                                now,
                                Set.of());

                UserDto studentDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                                12345678, "COSC", 2025, 3, null, null, null, true);
                when(applicationMapper.toDto(Mockito.any(Application.class))).thenReturn(mockedDto);
                when(userInterface.getStudentById(1L)).thenReturn(ResponseEntity.ok(studentDto));
                when(notificationClient.sendEmail(any())).thenReturn(null);

        ApplicationDto applicationDto = applicationService.submitApplication(applicationRequest, userIdFromHeader,
                List.of("ROLE_STUDENT"));

                assertEquals(1L, applicationDto.studentId());
                assertFalse(applicationDto.wantRemote());

        verify(applicationRepository).save(Mockito.any(Application.class));
        verify(applicationMapper).toDto(Mockito.any(Application.class));
        verify(auditService).record(
                eq(userIdFromHeader),
                eq(ActionOptions.CREATE),
                eq("Application"),
                isNull(),
                eq(mockApp),
                isNull());
    }

    @Test
    void testGetApplication_Forbidden() {
        AuthorizationException e = assertThrows(AuthorizationException.class, () -> {
            applicationService.getApplication(2L, 2025, "W1",1L,
                    List.of("ROLE_STUDENT"));
        });
        assertEquals("Not allowed", e.getMessage());
    }

    @Test
    void testGetApplication_NotFound() {
        when(applicationRepository.findByStudentIdAndYearAndSemester(1L, 2025, "W1")).thenReturn(Optional.empty());

        NotFoundException e = assertThrows(NotFoundException.class, () -> {
            applicationService.getApplication(1L, 2025, "W1",1L,
                    List.of("ROLE_STUDENT"));
        });
        assertEquals("Application with that student id, year, and semester doesn't exist", e.getMessage());
    }

        @Test
        void testGetApplication_Success() {
                Application application = new Application(1L, List.of(Subject.COSC), ApplicationType.UNDERGRADUATE,
                                false, 6,
                                2025, "W1");

                when(applicationRepository.findByStudentIdAndYearAndSemester(1L, 2025, "W1"))
                                .thenReturn(Optional.of(application));

                ApplicationDto mockedDto = new ApplicationDto(
                                1L,
                                1L,
                                List.of(Subject.COSC),
                                ApplicationType.UNDERGRADUATE,
                                false,
                                6, 2025, "W1",
                                application.getSubmittedAt(),
                                Set.of());

                when(applicationMapper.toDto(application)).thenReturn(mockedDto);

                ApplicationDto applicationDto = applicationService.getApplication(1L, 2025, "W1", 1L,
                                List.of("ROLE_STUDENT"));

                assertEquals(1L, applicationDto.studentId());
                assertFalse(applicationDto.wantRemote());
        }

        @Test
        void testDeleteApplication_Forbidden() {
                AuthorizationException e = assertThrows(AuthorizationException.class, () -> {
                        applicationService.deleteApplication(2L, 2025, "W1", 1L,
                                        List.of("ROLE_STUDENT"));
                });
                assertEquals("Not allowed", e.getMessage());
        }

    @Test
    void testDeleteApplication_NotFound() {
        int currentYear = 2025;
        when(applicationRepository.findByStudentIdAndYearAndSemester(1L, currentYear, "W1"))
                                .thenReturn(Optional.empty());
        NotFoundException e = assertThrows(NotFoundException.class, () -> {
            applicationService.deleteApplication(1L, 2025, "W1",1L,
                    List.of("ROLE_STUDENT"));
        });
        assertEquals("Application with student id 1 and year 2025 doesn't exist", e.getMessage());
    }

    @Test
    void testDeleteApplication_Success() {
        int currentYear = 2025;
        Application toDelete = new Application();
        toDelete.setId(42L);
        toDelete.setStudentId(1L);
        toDelete.setYear(currentYear);
        when(applicationRepository.findByStudentIdAndYearAndSemester(1L, currentYear, "W1"))
                                .thenReturn(Optional.of(toDelete));
        String result = applicationService.deleteApplication(
                                1L,2025, "W1",
                                1L,
                                List.of("ROLE_STUDENT"));
                assertEquals("Application deleted", result);

                verify(auditService).record(
                                eq(1L),
                                eq(ActionOptions.DELETE),
                                eq("Application"),
                                eq(toDelete),
                                eq(null),
                                eq(toDelete.getId()));

                verify(applicationRepository).delete(toDelete);
    }

    @Test
    void testUpdateApplication_Forbidden() {
        ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE, false, 6, 2025, "W1", unavailabilities);
        AuthorizationException e = assertThrows(AuthorizationException.class, () -> {
            applicationService.updateApplication(applicationRequest, 2L, 2025, "W1",1L,
                    List.of("ROLE_STUDENT"));
        });
        assertEquals("Not allowed", e.getMessage());
    }

        @Test
        void testUpdateApplication_NotFound() {
                ApplicationRequest applicationRequest = new ApplicationRequest(List.of(Subject.COSC),
                                ApplicationType.UNDERGRADUATE, false, 6, 2025, "W1", unavailabilities);
                when(applicationRepository.findByStudentIdAndYearAndSemester(1L, 2025, "W1"))
                                .thenReturn(Optional.empty());
                NotFoundException e = assertThrows(NotFoundException.class, () -> {
                        applicationService.updateApplication(applicationRequest, 1L, 2025, "W1", 1L,
                                        List.of("ROLE_STUDENT"));
                });
                assertEquals("Application with that student id, year, and semester doesn't exist", e.getMessage());
        }

    @Test
    void testUpdateApplication_DeadlinePassed_BadRequest() {
        // Arrange
        ApplicationRequest request = new ApplicationRequest(
            List.of(Subject.COSC),
            ApplicationType.UNDERGRADUATE,
            false,
            6, 2025, "W1",
            Set.of(new UnavailabilityDto(Day.MONDAY, "09:00", "10:00"))
        );

                // Mock configService returning expired deadline
                DeadlineDto expiredDeadline = new DeadlineDto(
                                "student_application_deadline",
                                LocalDateTime.now().minusDays(2),
                                LocalDateTime.now().minusDays(1));

                when(configService.getDeadlineByName(anyString()))
                                .thenReturn(expiredDeadline);

        // Act + Assert
        BadRequestException e = assertThrows(BadRequestException.class, () -> {
            applicationService.updateApplication(
                request,
                1L, // studentId
                2025, "W1",
                1L, // userIdFromHeader (same user, so authorized)
                List.of("ROLE_STUDENT")
            );
        });

                assertEquals("The application deadline has passed.", e.getMessage());
        }

    @Test
    void testUpdateApplication_Success() {
        LocalDateTime now = LocalDate.now().atStartOfDay();
        int currentYear = now.getYear();

        ApplicationRequest applicationRequest = new ApplicationRequest(
                List.of(Subject.COSC), ApplicationType.UNDERGRADUATE, false, 6, 2025, "W1", unavailabilities);
        Application before = new Application(1L, List.of(Subject.DATA, Subject.MATH, Subject.PHYS),
                                ApplicationType.UNDERGRADUATE, true, 12, 2025, "W1");
        before.setSubmittedAt(now);

        Application b = new Application(before);

        when(applicationRepository.findByStudentIdAndYearAndSemester(1L, currentYear, "W1"))
                                .thenReturn(Optional.of(before));

        Application after = new Application(1L, List.of(Subject.COSC), ApplicationType.UNDERGRADUATE, false, 6,
                                2025,
                                "W1");
        after.setSubmittedAt(now);
        after.setId(1L);
        Set<Unavailability> unava = new HashSet<>();
        unava.add(new Unavailability(Day.MONDAY, LocalTime.parse("09:00"), LocalTime.parse("10:00"),after));
        after.setUnavailabilities(unava);

        ApplicationDto mockedDto = new ApplicationDto(
                1L,
                1L,
                List.of(Subject.COSC),
                ApplicationType.UNDERGRADUATE,
                false,
                6,
                2025, "W1",
                now,
                Set.of());

        when(applicationMapper.toDto(before)).thenReturn(mockedDto);
        when(applicationRepository.save(Mockito.any(Application.class)))
                .thenAnswer(invocation -> {
                    Application saved = invocation.getArgument(0);
                    saved.setId(after.getId());
                    return saved;
                });

        ApplicationDto applicationDto = applicationService.updateApplication(
                applicationRequest, 1L, 2025, "W1",1L, List.of("ROLE_STUDENT"));

        verify(applicationRepository).save(before);
        verify(auditService).record(
                eq(1L),
                eq(ActionOptions.UPDATE),
                eq("Application"),
                eq(b),
                eq(after),
                eq(before.getId()));

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
                Application app1 = new Application(1L, List.of(Subject.COSC), ApplicationType.UNDERGRADUATE, false, 6,
                                2025,
                                "W1");
                Application app2 = new Application(1L, List.of(Subject.DATA), ApplicationType.UNDERGRADUATE, true, 12,
                                2025,
                                "W1");

                List<Application> applications = List.of(app1, app2);

                when(applicationRepository.findAllByStudentId(1L)).thenReturn(Optional.of(applications));

                ApplicationDto dto1 = new ApplicationDto(
                                1L,
                                1L,
                                List.of(Subject.COSC),
                                ApplicationType.UNDERGRADUATE,
                                false,
                                6, 2025, "W1",
                                app1.getSubmittedAt(),
                                Set.of());

                ApplicationDto dto2 = new ApplicationDto(
                                1L,
                                1L,
                                List.of(Subject.DATA),
                                ApplicationType.UNDERGRADUATE,
                                true,
                                12, 2025, "W1",
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
                Application app = new Application(1L, List.of(Subject.COSC, Subject.MATH),
                                ApplicationType.UNDERGRADUATE, false,
                                6, 2025, "W1");
                app.setSubmittedAt(LocalDateTime.of(2024, 1, 1, 12, 0));

                UserDto studentDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                                12345678, "COSC", 2025, 3, null, null, null, true);

                ApplicationWithStudentDto expectedDto = new ApplicationWithStudentDto(
                                1L,
                                studentDto,
                                List.of(Subject.COSC, Subject.MATH),
                                ApplicationType.UNDERGRADUATE,
                                false,
                                6, 2025, "W1",
                                LocalDateTime.of(2024, 1, 1, 12, 0),
                                Set.of());

                when(applicationRepository.findByFilters(2024, "W1", false, 6, Subject.COSC, null, null))
                                .thenReturn(List.of(app));
                when(userInterface.getStudentById(1L)).thenReturn(ResponseEntity.ok(studentDto));
                when(applicationMapper.toDtoWithStudent(app, studentDto)).thenReturn(expectedDto);

                List<ApplicationWithStudentDto> result = applicationService.getAllApplications(
                                2024, "W1", false, 6, Subject.COSC, null, null);

                assertEquals(1, result.size());
                ApplicationWithStudentDto dto = result.get(0);

                assertEquals(studentDto, dto.student());
                assertEquals(false, dto.wantRemote());
                assertEquals(6, dto.wantWorkingHours());
                assertTrue(dto.preferences().contains(Subject.COSC));
        }

        @Test
        void testGetAllApplications_page() {
                // given filter parameters
                Integer year = 2024;
                Boolean wantRemote = false;
                Integer hours = 6;
                String semester = "W1";
                Subject p1 = Subject.COSC;
                Subject p2 = null;
                Subject p3 = null;

                // sample Application entity
                Application app = new Application(1L, List.of(p1, Subject.MATH),
                                ApplicationType.UNDERGRADUATE,
                                wantRemote, hours, 2025, "W1");
                app.setSubmittedAt(LocalDateTime.of(2024, 1, 1, 12, 0));

                // sample UserDto
                UserDto studentDto = new UserDto(
                                2L, "Alice", "Wang", "awang@test.com",
                                List.of(UserRole.STUDENT),
                                12345678, "COSC", 2025, 3,
                                null, null, null, true);

                // expected DTO
                ApplicationWithStudentDto outDto = new ApplicationWithStudentDto(
                                1L,
                                studentDto,
                                app.getSubjectPreferences(),
                                app.getApplicationType(),
                                wantRemote,
                                hours,
                                year,
                                semester,
                                app.getSubmittedAt(),
                                Set.of());

                // pageable & page-of-entity setup
                Pageable pageable = PageRequest.of(0, 5);
                Page<Application> entityPage = new PageImpl<>(List.of(app), pageable, 1);

                // mock repository → page<Application>
                when(applicationRepository.findByFilters(
                                eq(year), eq(semester), eq(wantRemote), eq(hours),
                                eq(p1), eq(p2), eq(p3),
                                eq(pageable))).thenReturn(entityPage);

                // mock user client & mapper
                when(userInterface.getStudentById(app.getStudentId()))
                                .thenReturn(ResponseEntity.ok(studentDto));
                when(applicationMapper.toDtoWithStudent(app, studentDto))
                                .thenReturn(outDto);

                // when
                Page<ApplicationWithStudentDto> result = applicationService.getAllApplications(year, semester,
                                wantRemote,
                                hours, p1, p2, p3, pageable);

                // then
                assertEquals(1, result.getTotalElements());
                assertEquals(outDto, result.getContent().get(0));

                // verify repository called
                verify(applicationRepository)
                                .findByFilters(year, semester, wantRemote, hours, p1, p2, p3, pageable);
        }

        @Test
        void testGetAllApplicationYears() {
                // given
                List<Integer> expectedYears = List.of(2023, 2024, 2025);
                when(applicationRepository.findDistinctYears()).thenReturn(expectedYears);

                // when
                List<Integer> result = applicationService.getAllApplicationYears();

                // then
                assertEquals(expectedYears, result);
                verify(applicationRepository).findDistinctYears();
        }

        @Test
        void testGetAllApplicationSemesters() {
                // given
                List<String> expectedSemesters = List.of("W1", "W2", "S1", "S2");
                when(applicationRepository.findDistinctSemesters()).thenReturn(expectedSemesters);

                // when
                List<String> result = applicationService.getAllApplicationSemesters();

                // then
                assertEquals(expectedSemesters, result);
                verify(applicationRepository).findDistinctSemesters();
        }

        @Test
        void testGetAllActiveApplicationsByStudentId_Success() {
                Long studentId = 1L;
                List<String> roles = List.of("ROLE_STUDENT");

                SemesterDto active1 = new SemesterDto(1L, 2025, "W1", LocalDate.now(), LocalDate.now().plusMonths(3),
                                true);
                SemesterDto active2 = new SemesterDto(2L, 2025, "S1", LocalDate.now(), LocalDate.now().plusMonths(3),
                                true);
                List<SemesterDto> activeSemesters = List.of(active1, active2);

                Application app1 = new Application(studentId, List.of(Subject.COSC), ApplicationType.UNDERGRADUATE,
                                false, 6, 2025, "W1");
                Application app2 = new Application(studentId, List.of(Subject.MATH), ApplicationType.UNDERGRADUATE,
                                true, 8, 2025, "S1");

                ApplicationDto dto1 = new ApplicationDto(1L, studentId, List.of(Subject.COSC),
                                ApplicationType.UNDERGRADUATE, false, 6, 2025, "W1", LocalDateTime.now(), Set.of());
                ApplicationDto dto2 = new ApplicationDto(2L, studentId, List.of(Subject.MATH),
                                ApplicationType.UNDERGRADUATE, true, 8, 2025, "S1", LocalDateTime.now(), Set.of());

                when(courseInterface.getActiveSemesters()).thenReturn(ResponseEntity.ok(activeSemesters));
                when(applicationRepository.findAllByStudentId(studentId)).thenReturn(Optional.of(List.of(app1, app2)));
                when(applicationMapper.toDto(app1)).thenReturn(dto1);
                when(applicationMapper.toDto(app2)).thenReturn(dto2);

                List<ApplicationDto> result = applicationService.getAllActiveApplicationsByStudentId(studentId,
                                studentId, roles);

                assertEquals(2, result.size());
                assertTrue(result.contains(dto1));
                assertTrue(result.contains(dto2));
        }

        @Test
        void testGetAllActiveApplicationsByStudentId_Forbidden() {
                AuthorizationException ex = assertThrows(AuthorizationException.class, () -> {
                        applicationService.getAllActiveApplicationsByStudentId(2L, 1L, List.of("ROLE_STUDENT"));
                });
                assertEquals("Not allowed", ex.getMessage());
        }

        @Test
        void testGetAllActiveApplicationsByStudentId_NoActiveSemesters() {
                when(courseInterface.getActiveSemesters()).thenReturn(ResponseEntity.ok(null));
                NotFoundException ex = assertThrows(NotFoundException.class, () -> {
                        applicationService.getAllActiveApplicationsByStudentId(1L, 1L, List.of("ROLE_STUDENT"));
                });
                assertEquals("No active semesters", ex.getMessage());
        }

        @Test
        void testGetAllActiveApplicationsByStudentId_SomeMissingApplications() {
                Long studentId = 1L;

                SemesterDto active1 = new SemesterDto(1L, 2025, "W1", LocalDate.now(), LocalDate.now().plusMonths(3),
                                true);
                SemesterDto active2 = new SemesterDto(2L, 2025, "S1", LocalDate.now(), LocalDate.now().plusMonths(3),
                                true);
                List<SemesterDto> semesters = List.of(active1, active2);

                Application app = new Application(studentId, List.of(Subject.COSC), ApplicationType.UNDERGRADUATE,
                                false, 6, 2025, "W1");
                ApplicationDto dto = new ApplicationDto(1L, studentId, List.of(Subject.COSC),
                                ApplicationType.UNDERGRADUATE, false, 6, 2025, "W1", LocalDateTime.now(), Set.of());

                when(courseInterface.getActiveSemesters()).thenReturn(ResponseEntity.ok(semesters));
                when(applicationRepository.findAllByStudentId(studentId)).thenReturn(Optional.of(List.of(app)));
                when(applicationMapper.toDto(app)).thenReturn(dto);

                List<ApplicationDto> result = applicationService.getAllActiveApplicationsByStudentId(studentId,
                                studentId,
                                List.of("ROLE_STUDENT"));

                assertEquals(1, result.size());
                assertEquals(dto, result.get(0));
        }

        @Test
        void testGetAllActiveApplicationsByStudentId_NoApplicationsFound() {
                when(courseInterface.getActiveSemesters()).thenReturn(ResponseEntity.ok(List.of(
                                new SemesterDto(1L, 2025, "W1", LocalDate.now(), LocalDate.now().plusMonths(3),
                                                true))));
                when(applicationRepository.findAllByStudentId(1L)).thenReturn(Optional.empty());

                NotFoundException ex = assertThrows(NotFoundException.class, () -> {
                        applicationService.getAllActiveApplicationsByStudentId(1L, 1L, List.of("ROLE_STUDENT"));
                });
                assertEquals("No applications for this student", ex.getMessage());
        }

        @Test
        public void testGetAllGraduateApplicants_returnsCorrectStudents() {

        Application app1 = new Application();
        app1.setStudentId(1L);
        app1.setApplicationType(ApplicationType.GRADUATE);

        Application app2 = new Application();
        app2.setStudentId(2L);
        app2.setApplicationType(ApplicationType.GRADUATE);

        List<Application> apps = List.of(app1, app2);
        when(applicationRepository.findByapplicationType(ApplicationType.GRADUATE)).thenReturn(apps);

        UserDto s1 = new UserDto(
                        1L,
                        "Alice",
                        "Smith",
                        "alice@example.com",
                        List.of(UserRole.STUDENT),
                        12345678,
                        "COSC",
                        2022,
                        4,
                        null,
                        "COSC",
                        LocalDateTime.now(),
                        true
        );
        UserDto s2 = new UserDto(
                        2L,
                        "John",
                        "Smith",
                        "john@example.com",
                        List.of(UserRole.STUDENT),
                        12456543,
                        "COSC",
                        2022,
                        4,
                        null,
                        "COSC",
                        LocalDateTime.now(),
                        true
        );
        when(userInterface.getStudentsByIds(List.of(1L, 2L))).thenReturn(List.of(s1, s2));

        List<UserDto> result = applicationService.getAllGraduateApplicants();

        assertEquals(2, result.size());
        assertEquals("Alice", result.get(0).firstName());
    }

}
