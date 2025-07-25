package com.infinity.applicationservice;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.infinity.applicationservice.dtos.Allocations.AllocatedSectionDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationRequest;
import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Courses.CourseDto;
import com.infinity.applicationservice.dtos.Courses.SectionDto;
import com.infinity.applicationservice.dtos.DeadlineDto;
import com.infinity.applicationservice.dtos.Needs.NeedDto;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.ApplicationStatus;
import com.infinity.applicationservice.enums.ApplicationType;
import com.infinity.applicationservice.enums.SectionType;
import com.infinity.applicationservice.enums.TaskType;
import com.infinity.applicationservice.enums.UserRole;
import com.infinity.applicationservice.exceptions.AuthorizationException;
import com.infinity.applicationservice.exceptions.BadRequestException;
import com.infinity.applicationservice.exceptions.NotFoundException;
import com.infinity.applicationservice.feign.CourseInterface;
import com.infinity.applicationservice.feign.NotificationClient;
import com.infinity.applicationservice.feign.UserInterface;
import com.infinity.applicationservice.models.AllocatedSection;
import com.infinity.applicationservice.models.Allocation;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.repositories.AllocatedSectionRepository;
import com.infinity.applicationservice.repositories.AllocationRepository;
import com.infinity.applicationservice.repositories.ApplicationRepository;
import com.infinity.applicationservice.repositories.ConfigRepository;
import com.infinity.applicationservice.services.AllocationService;
import com.infinity.applicationservice.services.ConfigService;
import com.infinity.applicationservice.utility.AllocationMapper;
import com.infinity.applicationservice.utility.ApplicationMapper;
import com.infinity.applicationservice.utility.EmailMapper;

@ExtendWith(MockitoExtension.class)
class AllocationServiceTest {

        @Mock
        private AllocationRepository allocationRepository;
        @Mock
        private ApplicationRepository applicationRepository;
        @Mock
        private AllocatedSectionRepository allocatedSectionRepository;
        @Mock
        ConfigRepository configRepository;
        @Mock
        private CourseInterface courseInterface;
        @Mock
        private UserInterface userInterface;
        @Mock
        private ApplicationMapper applicationMapper;
        @Mock
        private AllocationMapper allocationMapper;
        @Mock
        private NotificationClient notificationClient;
        @Mock
        private EmailMapper emailMapper;

        @InjectMocks
        AllocationService allocationService;
        @Mock
        ConfigService configService;

        @BeforeEach
        void mockDeadline() {
                DeadlineDto dto = new DeadlineDto(
                "student_application_deadline",
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now().plusDays(1)
                );

                lenient().when(configService.getDeadlineByName(anyString()))
                .thenReturn(dto);
        }

        @Test
        void getAllocationByStudentId_returnsMappedDtoList() {
                Long studentId = 1L;

                Application application = new Application();
                application.setId(1L);
                application.setStudentId(studentId);
                Allocation allocation = new Allocation();
                allocation.setId(101L);
                allocation.setStudentId(studentId);
                allocation.setStatus(ApplicationStatus.CONFIRMED);
                allocation.setGradingHours(10);
                allocation.setApplication(application);
                AllocatedSection allocatedSection = new AllocatedSection();
                allocatedSection.setId(1L);
                allocatedSection.setSectionId(1001L);
                allocatedSection.setAllocation(allocation);
                allocation.setAllocatedSections(List.of(allocatedSection));

                UserDto studentDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                                12345678, "COSC", 2025, 3, null, null, null, true);
                
                ApplicationDto applicationDto = new ApplicationDto(1L, studentId, null, ApplicationType.UNDERGRADUATE,
                                false,
                                null, null, Set.of());
                AllocationHistoryDto expectedDto = new AllocationHistoryDto(101L, studentDto, applicationDto,
                                ApplicationStatus.CONFIRMED, 0, 10, 0, List.of());

                when(allocationRepository.findByStudentId(studentId)).thenReturn(allocation);
                when(userInterface.getStudentById(studentId)).thenReturn(ResponseEntity.ok(studentDto));
                when(applicationMapper.toDto(application)).thenReturn(applicationDto);
                when(allocationMapper.toDto(allocation, studentDto, applicationDto))
                                .thenReturn(expectedDto);

                AllocationHistoryDto result = allocationService.getAllocationByStudentId(studentId);
                assertNotNull(result);
                assertEquals(expectedDto, result);
                verify(allocationRepository).findByStudentId(studentId);
                verify(userInterface).getStudentById(studentId);
                verify(applicationMapper).toDto(application);
                verify(allocationMapper).toDto(allocation, studentDto, applicationDto);
        }

        @Test
        void testAllocateStudent_ThrowsIfAlreadyAllocated() {
                Long studentId = 1L;
                Long applicationId = 1L;
                Long sectionId = 1001L;
                Application application = new Application();
                application.setId(applicationId);
                application.setStudentId(1L);
                application.setSubmittedAt(LocalDateTime.now());
                Allocation allocation = new Allocation();
                allocation.setId(1L);
                allocation.setStudentId(1L);
                allocation.setApplication(application);
                AllocatedSection allocatedSection = new AllocatedSection();
                allocatedSection.setId(1L);
                allocatedSection.setSectionId(sectionId);
                allocatedSection.setAllocation(allocation);
                allocation.setAllocatedSections(List.of(allocatedSection));
                when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
                when(allocationRepository.existsByApplicationId(applicationId)).thenReturn(true);
                when(allocationRepository.findByApplicationId(applicationId)).thenReturn(allocation);
                when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
                // when(allocatedSectionRepository.findById(allocatedSection.getId())).thenReturn(Optional.of(allocatedSection));
                when(allocatedSectionRepository.existsBySectionIdAndAllocationId(sectionId, allocation.getId()))
                                .thenThrow(new BadRequestException("You have already allocated this student to that section"));

                AllocationRequest request = new AllocationRequest(1L, 1L, ApplicationStatus.SENT, TaskType.GRADING, 0, 10, 0, sectionId);

                assertThrows(BadRequestException.class, () -> allocationService.allocateStudent(request));
        }

        @Test
        void allocateStudent_returnsExpectedDto() {
                Long studentId = 2L;
                Long sectionId = 1001L;
                Long applicationId = 1L;

                AllocationRequest request = new AllocationRequest(
                                studentId,
                                applicationId,
                                ApplicationStatus.SENT,
                                TaskType.GRADING,
                                0, 10, 0,
                                sectionId);

                Application application = new Application();
                application.setId(applicationId);
                application.setStudentId(studentId);
                application.setSubmittedAt(LocalDateTime.now());

                Allocation savedAllocation = new Allocation();
                savedAllocation.setId(500L);
                savedAllocation.setStudentId(studentId);
                savedAllocation.setStatus(ApplicationStatus.SENT);
                savedAllocation.setGradingHours(5);
                savedAllocation.setApplication(application);

                AllocatedSection allocatedSection = new AllocatedSection();
                allocatedSection.setId(10L);
                allocatedSection.setAllocation(savedAllocation);
                allocatedSection.setSectionId(sectionId);
                allocatedSection.setTask(TaskType.GRADING);

                UserDto studentDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                                12345678, "COSC", 2025, 3, null, null, null, true);
                ;
                SectionDto sectionDto = new SectionDto(sectionId, 2025, "Fall", "T01", SectionType.TUTORIAL,
                                new CourseDto(1L, "COSC", "Capstone", "499"),1);
                ApplicationDto applicationDto = new ApplicationDto(1L, studentId, null, ApplicationType.UNDERGRADUATE,
                                false,
                                null, LocalDateTime.now(), Set.of());
                AllocationHistoryDto expectedDto = new AllocationHistoryDto(500L, studentDto, applicationDto,
                                ApplicationStatus.SENT, 0, 10, 0,
                                List.of());

                when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
                when(allocationRepository.save(any(Allocation.class))).thenReturn(savedAllocation);
                when(allocatedSectionRepository.save(any(AllocatedSection.class))).thenReturn(allocatedSection);
                when(userInterface.getStudentById(studentId)).thenReturn(ResponseEntity.ok(studentDto));
                when(applicationMapper.toDto(application)).thenReturn(applicationDto);
                when(allocationMapper.toDto(any(), any(), any()))
                                .thenReturn(expectedDto); 
                when(notificationClient.sendEmail(any())).thenReturn(null);

                AllocationHistoryDto result = allocationService.allocateStudent(request);

                assertNotNull(result);
                assertEquals(expectedDto, result);
                assertEquals(500L, result.id());
                assertEquals(studentId, result.student().id());
                assertEquals("Alice", result.student().firstName());
                assertEquals(result.status(), ApplicationStatus.SENT);

                verify(applicationRepository).findById(applicationId);
                verify(allocationRepository).save(any(Allocation.class));
                verify(userInterface).getStudentById(studentId);
                verify(applicationMapper).toDto(application);
        }

        @Test
        void deallocateStudent_Success() {
                Long studentId = 2L;
                Long sectionId = 1001L;
                Long applicationId = 1L;
                AllocatedSection allocatedSection = new AllocatedSection();
                allocatedSection.setId(10L);
                allocatedSection.setSectionId(sectionId);
                allocatedSection.setTask(TaskType.GRADING);
                when(allocatedSectionRepository.findById(any())).thenReturn(Optional.of(allocatedSection));

                Application application = new Application();
                application.setId(applicationId);
                application.setStudentId(studentId);
                application.setSubmittedAt(LocalDateTime.now());

                Allocation allocation = new Allocation();
                allocation.setId(500L);
                allocation.setStudentId(studentId);
                allocation.setStatus(ApplicationStatus.CONFIRMED);
                allocation.setGradingHours(5);
                allocation.setApplication(application);
                allocation.setAllocatedSections(List.of(allocatedSection));
                allocatedSection.setAllocation(allocation);
                SectionDto sectionDto = new SectionDto(1L, 2025, "Fall", "T01", SectionType.TUTORIAL,
                                new CourseDto(1L, "COSC", "Capstone", "499"),1);
                NeedDto needDto = new NeedDto(1L, 1L, "description", 12, 0, 2025, "W1", null);

                when(courseInterface.getSectionById(any())).thenReturn(sectionDto);
                when(courseInterface.getNeed(1L, sectionDto.year(), sectionDto.semester())).thenReturn(needDto);
                when(allocationRepository.findById(any())).thenReturn(Optional.of(allocation));
                String message = allocationService.deallocateStudent(1L);
                verify(allocatedSectionRepository).delete(allocatedSection);
                assertEquals(message, "Student deallocated");
        }

        @Test
        void acceptOffer_setsConfirmedTrue() {
                Long allocationId = 99L;
                AllocatedSection allocatedSection = new AllocatedSection();
                allocatedSection.setId(10L);
                allocatedSection.setSectionId(1L);
                allocatedSection.setTask(TaskType.GRADING);
                Allocation allocation = new Allocation();
                allocation.setId(allocationId);
                allocation.setStatus(ApplicationStatus.SENT);
                allocation.setApplication(new Application());
                allocation.getApplication().setId(1L);
                allocation.setAllocatedSections(List.of(allocatedSection));
                SectionDto sectionDto = new SectionDto(1L, 2025, "Fall", "T01", SectionType.TUTORIAL,
                                new CourseDto(1L, "COSC", "Capstone", "499"),1);
                NeedDto needDto = new NeedDto(1L, 1L, "description", 12, 0, 2025, "W1", null);

                when(allocationRepository.findById(allocationId)).thenReturn(Optional.of(allocation));
                when(courseInterface.getSectionById(any())).thenReturn(sectionDto);
                when(courseInterface.getNeed(1L, sectionDto.year(),sectionDto.semester())).thenReturn(needDto);

                allocationService.updateConfirmationStatus(allocationId, ApplicationStatus.CONFIRMED);

                assertEquals(allocation.getStatus(), ApplicationStatus.CONFIRMED);
                verify(allocationRepository).save(allocation);
        }

        @Test
        void testUpdateConfirmationStatus_DeadlinePassed_BadRequest() {
        // Arrange
        Long allocationId = 1L;

        Allocation allocation = new Allocation();
        allocation.setId(allocationId);
        allocation.setStatus(ApplicationStatus.SENT);
        allocation.setApplication(new Application());

        // Mock repository returning allocation
        when(allocationRepository.findById(allocationId)).thenReturn(Optional.of(allocation));

        // Mock expired deadline
        DeadlineDto expiredDeadline = new DeadlineDto(
                "student_offer_accept_deadline",
                LocalDateTime.now().minusDays(2),
                LocalDateTime.now().minusDays(1)
        );

        when(configService.getDeadlineByName(anyString())).thenReturn(expiredDeadline);

        // Act + Assert
        BadRequestException e = assertThrows(BadRequestException.class, () -> {
                allocationService.updateConfirmationStatus(allocationId, ApplicationStatus.CONFIRMED);
        });

        assertEquals("The application deadline has passed.", e.getMessage());
        }


        @Test
        void denyOffer_setsConfirmedFalse() {
                Long allocationId = 100L;
                Allocation allocation = new Allocation();
                allocation.setId(allocationId);
                allocation.setStatus(ApplicationStatus.CONFIRMED);

                when(allocationRepository.findById(allocationId)).thenReturn(Optional.of(allocation));

                allocationService.updateConfirmationStatus(allocationId, ApplicationStatus.REJECTED);

                assertEquals(allocation.getStatus(), ApplicationStatus.REJECTED);
                verify(allocationRepository).save(allocation);
        }

        @Test
        void acceptOffer_throwsIfNotFound() {
                when(allocationRepository.findById(123L)).thenReturn(Optional.empty());
                
                assertThrows(NotFoundException.class, () -> allocationService.updateConfirmationStatus(123L,
                                ApplicationStatus.CONFIRMED));
        }

        @Test
        void denyOffer_throwsIfNotFound() {
                when(allocationRepository.findById(123L)).thenReturn(Optional.empty());
                assertThrows(NotFoundException.class, () -> allocationService.updateConfirmationStatus(123L,
                                ApplicationStatus.REJECTED));
        }

        @Test
        void allocateStudent_throwsIfApplicationNotFound() {
                Long studentId = 1L;
                Long sectionId = 1001L;
                Long applicationId = 99L;

                AllocationRequest request = new AllocationRequest(
                                studentId,
                                applicationId,
                                ApplicationStatus.REJECTED, TaskType.GRADING,
                                0, 5, 0,
                                sectionId);

                when(applicationRepository.findById(applicationId)).thenReturn(Optional.empty());

                assertThrows(NotFoundException.class, () -> {
                        allocationService.allocateStudent(request);
                });

                verify(applicationRepository).findById(applicationId);
                verifyNoInteractions(allocationRepository, userInterface, courseInterface);
        }

        @Test
        void getAllocationsByConfirmationStatus_returnsFilteredResults() {
                Allocation a1 = new Allocation();
                a1.setId(1L);
                a1.setStatus(ApplicationStatus.CONFIRMED);
                Allocation a2 = new Allocation();
                a2.setId(2L);
                a2.setStatus(ApplicationStatus.REJECTED);
                a1.setStudentId(1L);
                a2.setStudentId(1L);

                Application application = new Application();
                application.setId(1L);
                application.setStudentId(1L);
                application.setSubmittedAt(LocalDateTime.now());
                a1.setApplication(application);
                a2.setApplication(application);

                UserDto studentDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                                12345678, "COSC", 2025, 3, null,
                                null, null, true);
                SectionDto sectionDto = new SectionDto(1L, 2025, "Winter", "001", SectionType.LABORATORY,
                                new CourseDto(1L, "COSC", "capstone", "499"),1);
                ApplicationDto applicationDto = new ApplicationDto(1l, 1L, List.of(), ApplicationType.UNDERGRADUATE,
                                false, 6, LocalDateTime.now(), Set.of());

                AllocationHistoryDto expectedDto = new AllocationHistoryDto(1L, studentDto, applicationDto,
                                ApplicationStatus.CONFIRMED, 0, 10, 0, List.of());

                when(allocationRepository.findAll()).thenReturn(List.of(a1, a2));
                when(userInterface.getStudentById(1L)).thenReturn(ResponseEntity.ok(studentDto));
                when(applicationMapper.toDto(application)).thenReturn(applicationDto);
                when(allocationMapper.toDto(a1, studentDto, applicationDto)).thenReturn(expectedDto);

                List<AllocationHistoryDto> result = allocationService
                                .getAllocationsByConfirmationStatus(ApplicationStatus.CONFIRMED);

                assertEquals(1, result.size());
                assertEquals(result.get(0).status(), ApplicationStatus.CONFIRMED);

                verify(allocationRepository).findAll();
                verify(userInterface).getStudentById(1L);
                verify(applicationMapper).toDto(application);
                verify(allocationMapper).toDto(a1, studentDto, applicationDto);
        }

        @Test
        void getAllocationsBySectionId_returnsFilteredResults() {
                Long sectionId = 1L;
                Long allocationId = 100L;
                Long studentId = 200L;

                AllocatedSection allocatedSection = new AllocatedSection();
                allocatedSection.setId(10L);
                allocatedSection.setSectionId(sectionId);
                allocatedSection.setTask(TaskType.GRADING);

                Allocation allocation = new Allocation();
                allocation.setId(allocationId);
                allocation.setStudentId(studentId);

                // Link the mock relationship
                allocatedSection.setAllocation(allocation);

                // Mock repo & client behavior
                when(allocatedSectionRepository.findAllBySectionId(sectionId))
                .thenReturn(List.of(allocatedSection));

                when(allocationRepository.findById(allocationId))
                .thenReturn(Optional.of(allocation));

                // Act
                List<AllocatedSectionDto> result = allocationService.getAllocationsBySectionId(sectionId);

                // Assert
                assertEquals(1, result.size());
                AllocatedSectionDto dto = result.get(0);
                assertEquals(10L, dto.id());
                assertEquals(allocationId, dto.allocationId());
                assertEquals(sectionId, dto.sectionId());
                assertEquals(TaskType.GRADING, dto.task());
        }
        

        @Test
        void getAllocationsByApplicationId_NotAuthorized() {

                when(allocationRepository.existsByStudentIdAndApplicationId(1L, 1L)).thenReturn(false);

                assertThrows(AuthorizationException.class, () -> allocationService.getAllocationByApplicationId(1L, 1L,
                                List.of("ROLE_STUDENT")));
        }

        @Test
        void getAllocationByApplicationId_returnsFilteredResult() {
                Application app1 = new Application();
                app1.setId(1L);
                app1.setStudentId(1L);
                app1.setSubmittedAt(LocalDateTime.now());

                Application app2 = new Application();
                app2.setId(2L);
                app2.setStudentId(2L);
                app2.setSubmittedAt(LocalDateTime.now());

                Allocation a1 = new Allocation();
                a1.setId(1L);
                a1.setApplication(app1);
                a1.setStudentId(1L);

                Allocation a2 = new Allocation();
                a2.setId(2L);
                a2.setApplication(app2);
                a2.setStudentId(2L);

                UserDto studentDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                                12345678, "COSC", 2025, 3, null, null, null, true);
                ;
                ApplicationDto applicationDto = new ApplicationDto(1L, 1L, List.of(), ApplicationType.UNDERGRADUATE,
                                false, 6, app1.getSubmittedAt(), Set.of());
                AllocationHistoryDto historyDto = new AllocationHistoryDto(1L, studentDto, applicationDto,
                                ApplicationStatus.CONFIRMED, 0, 10, 0, List.of());

                when(allocationRepository.findByApplicationId(1L)).thenReturn(a1);
                when(userInterface.getStudentById(1L)).thenReturn(ResponseEntity.ok(studentDto));
                when(applicationMapper.toDto(app1)).thenReturn(applicationDto);
                when(allocationMapper.toDto(a1, studentDto, applicationDto)).thenReturn(historyDto);
                when(allocationRepository.existsByStudentIdAndApplicationId(1L, 1L)).thenReturn(true);

                AllocationHistoryDto result = allocationService.getAllocationByApplicationId(1L, 1L,
                                List.of("ROLE_COORDINATOR"));

                assertEquals(1L, result.applicationDto().studentId());
        }

        @Test
        void getAllocationsByApplicationYear_returnsFilteredResults() {
                LocalDateTime now = LocalDateTime.of(2025, 7, 1, 10, 0);

                Application app1 = new Application();
                app1.setId(1L);
                app1.setStudentId(1L);
                app1.setSubmittedAt(now);

                Application app2 = new Application();
                app2.setId(2L);
                app2.setStudentId(1L);
                app2.setSubmittedAt(now.minusYears(2));

                Allocation a1 = new Allocation();
                a1.setId(1L);
                a1.setApplication(app1);
                a1.setStudentId(1L);

                Allocation a2 = new Allocation();
                a2.setId(2L);
                a2.setApplication(app2);
                a2.setStudentId(1L);

                UserDto studentDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                                12345678, "COSC", 2025, 3, null, null, null, true);
                SectionDto sectionDto = new SectionDto(1L, 2025, "Winter", "001", SectionType.LABORATORY,
                                new CourseDto(1L, "COSC", "capstone", "499"),1);
                ApplicationDto applicationDto = new ApplicationDto(1L, 1L, List.of(), ApplicationType.UNDERGRADUATE,
                                false, 6, now, Set.of());
                AllocationHistoryDto historyDto = new AllocationHistoryDto(1L, studentDto, applicationDto,
                                ApplicationStatus.CONFIRMED, 0, 10, 0, List.of());

                when(allocationRepository.findAll()).thenReturn(List.of(a1, a2));
                when(userInterface.getStudentById(1L)).thenReturn(ResponseEntity.ok(studentDto));
                when(applicationMapper.toDto(app1)).thenReturn(applicationDto);
                when(allocationMapper.toDto(a1, studentDto, applicationDto)).thenReturn(historyDto);

                List<AllocationHistoryDto> result = allocationService.getAllocationsByApplicationYear(2025);

                assertEquals(1, result.size());
                assertEquals(2025, result.get(0).applicationDto().timeSubmitted().getYear());
        }

        @Test
        void getAllocationsBySectionIdWithCourse_shouldReturnDtoList() {
                // Arrange
                Long sectionId = 1L;
                Long allocationId = 100L;

                Allocation allocation = new Allocation();
                allocation.setId(allocationId);

                AllocatedSection allocatedSection = new AllocatedSection();
                allocatedSection.setId(10L);
                allocatedSection.setSectionId(sectionId);
                allocatedSection.setTask(TaskType.GRADING);
                allocatedSection.setAllocation(allocation);

                when(allocatedSectionRepository.findAllBySectionId(sectionId))
                .thenReturn(List.of(allocatedSection));

                when(allocationRepository.findById(allocationId))
                .thenReturn(Optional.of(allocation));

                // Act
                List<AllocatedSectionDto> result = allocationService.getAllocationsBySectionIdWithCourse(sectionId);

                // Assert
                assertEquals(1, result.size());
                AllocatedSectionDto dto = result.get(0);
                assertEquals(10L, dto.id());
                assertEquals(allocationId, dto.allocationId());
                assertEquals(sectionId, dto.sectionId());
                assertEquals(TaskType.GRADING, dto.task());
        }

        @Test
        void getAllocationByStudentId_shouldReturnDtoSuccessfully() {
                // Arrange
                Long studentId = 1L;
                Long allocationId = 10L;
                Long sectionId = 100L;

                UserDto studentDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                                        12345678, "COSC", 2025, 3, null, null, null, true);
                Application application = new Application();
                application.setId(200L);
                ApplicationDto applicationDto = new ApplicationDto(200L, 1L, List.of(), ApplicationType.UNDERGRADUATE,
                                        false, 6, LocalDateTime.now(), Set.of());
                AllocatedSection allocatedSection = new AllocatedSection();
                allocatedSection.setSectionId(sectionId);

                Allocation allocation = new Allocation();
                allocation.setId(allocationId);
                allocation.setStudentId(studentId);
                allocation.setApplication(application);
                allocation.setAllocatedSections(List.of(allocatedSection));

                SectionDto sectionDto = new SectionDto(1L, 2025, "Winter", "001", SectionType.LABORATORY,
                                        new CourseDto(1L, "COSC", "capstone", "499"));
                AllocationHistoryDto expectedDto = new AllocationHistoryDto(101L, studentDto, applicationDto,
                                        ApplicationStatus.CONFIRMED, 0, 10, 0, List.of());

                when(allocationRepository.findByStudentId(studentId)).thenReturn(allocation);
                when(userInterface.getStudentById(studentId)).thenReturn(ResponseEntity.ok(studentDto));
                when(applicationMapper.toDto(application)).thenReturn(applicationDto);
                when(allocationMapper.toDto(allocation, studentDto, applicationDto)).thenReturn(expectedDto);

                // Act
                AllocationHistoryDto result = allocationService.getAllocationByStudentId(studentId);

                // Assert
                assertEquals(expectedDto, result);
        }

        @Test
        void getAllocationByStudentId_handlesNullApplication() {
                Long studentId = 1L;
                AllocatedSection allocatedSection = new AllocatedSection();
                allocatedSection.setId(10L);
                allocatedSection.setSectionId(1001L);
                allocatedSection.setTask(TaskType.GRADING);
                Application application = new Application();
                application.setId(200L);
                Allocation allocation = new Allocation();
                allocation.setId(101L);
                allocation.setStudentId(studentId);
                allocation.setStatus(ApplicationStatus.CONFIRMED);
                allocation.setGradingHours(10);
                allocation.setApplication(application);
                allocation.setAllocatedSections(List.of(allocatedSection));

                UserDto studentDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                                12345678, "COSC", 2025, 3, null, null, null, true);
                SectionDto sectionDto = new SectionDto(1001L, 2025, "Fall", "T01", SectionType.TUTORIAL,
                                new CourseDto(1L, "COSC", "Capstone", "499"),1);

                AllocationHistoryDto expectedDto = new AllocationHistoryDto(101L, studentDto, null,
                                ApplicationStatus.CONFIRMED, 0, 10, 0, List.of());

                when(allocationRepository.findByStudentId(studentId)).thenReturn(allocation);
                when(userInterface.getStudentById(studentId)).thenReturn(ResponseEntity.ok(studentDto));
                when(allocationMapper.toDto(allocation, studentDto, null)).thenReturn(expectedDto);

                AllocationHistoryDto result = allocationService.getAllocationByStudentId(studentId);

                assertEquals(expectedDto, result);

                verify(allocationRepository).findByStudentId(studentId);
                verify(userInterface).getStudentById(studentId);
                verify(allocationMapper).toDto(allocation, studentDto, null);
        }

        @Test
        void importPreviousAllocations_createsMissingCourseAndSection_whenAutoCreateIsTrue() {
                Map<String, String> csvData = Map.of(
                                "studentNum", "63260442",
                                "deptCode", "COSC",
                                "courseNum", "499",
                                "section", "001",
                                "year", "2025",
                                "semester", "W1");
                UserDto student = new UserDto(2L, "John", "Doe", "student@test.com", List.of(UserRole.STUDENT),
                                63260442, "COSC", 2022, 3, null, null, null, true);
                CourseDto course = new CourseDto(2L, "COSC", "Capstone", "499");
                SectionDto section = new SectionDto(3L, 2025, "W1", "001", SectionType.LECTURE, course,1);
                Allocation allocation = new Allocation();
                allocation.setId(4L);
                allocation.setStudentId(1L);
                allocation.setStatus(ApplicationStatus.CONFIRMED);

                AllocationHistoryDto dto = new AllocationHistoryDto(
                                allocation.getId(), student, null, ApplicationStatus.CONFIRMED, 0, 10, 0, List.of());

                when(userInterface.getStudentByNum(63260442)).thenReturn(ResponseEntity.ok(student));
                when(courseInterface.addCourse(any())).thenReturn(course); 
                when(courseInterface.getByCourseIdSectionYearSemester(2L, "001", 2025, "W1"))
                        .thenThrow(new RuntimeException("Not found"));
                when(courseInterface.addSection(eq(2L), any())).thenReturn(section);
                when(allocationRepository.save(any())).thenReturn(allocation);
                when(allocationMapper.toDto(any(), any(), any())).thenReturn(dto);

                List<AllocationHistoryDto> result = allocationService.importPreviousAllocations(
                                List.of(csvData), true);

                assertEquals(1, result.size());
                assertEquals("John", result.get(0).student().firstName());
                verify(courseInterface).addCourse(any());
                verify(courseInterface).addSection(eq(2L), any());
        }

        @Test
        void importPreviousAllocations_throwsNotFoundException_whenAutoCreateIsFalse_andCourseMissing() {
                Map<String, String> csvData = Map.of(
                                "studentNum", "63260442",
                                "deptCode", "COSC",
                                "courseNum", "499",
                                "section", "001",
                                "year", "2025",
                                "semester", "W1");

                UserDto student = new UserDto(2L, "John", "Doe", "student@test.com", List.of(UserRole.STUDENT),
                                63260442, "COSC", 2022, 3, null, null, null, true);

                when(userInterface.getStudentByNum(63260442)).thenReturn(ResponseEntity.ok(student));
                when(courseInterface.getCourseByDeptCodeAndCourseNum("COSC", "499"))
                       .thenReturn(ResponseEntity.of(Optional.empty())); // Simulate course not found

                NullPointerException ex = assertThrows(NullPointerException.class,
                                () -> allocationService.importPreviousAllocations(List.of(csvData), false));


                verify(courseInterface, never()).addCourse(any());
                verify(courseInterface, never()).addSection(anyLong(), any());
        }

        @Test
        void importPreviousAllocations_throwsNotFoundException_whenAutoCreateIsFalse_andSectionMissing() {
                Map<String, String> csvData = Map.of(
                                "studentNum", "63260442",
                                "deptCode", "COSC",
                                "courseNum", "499",
                                "section", "001",
                                "year", "2025",
                                "semester", "W1");
                UserDto student = new UserDto(2L, "John", "Doe", "student@test.com", List.of(UserRole.STUDENT),
                                63260442, "COSC", 2022, 3, null, null, null, true);
                CourseDto course = new CourseDto(2L, "COSC", "499", "Capstone");

                when(userInterface.getStudentByNum(63260442)).thenReturn(ResponseEntity.ok(student));
                when(courseInterface.getCourseByDeptCodeAndCourseNum("COSC", "499"))
                        .thenReturn(ResponseEntity.ok(course));
                when(courseInterface.getByCourseIdSectionYearSemester(2L, "001", 2025, "W1"))
                        .thenThrow(new RuntimeException("Section not found"));

                NotFoundException ex = assertThrows(NotFoundException.class,
                                () -> allocationService.importPreviousAllocations(List.of(csvData), false));

                assertTrue(ex.getMessage().contains("Section"));
                assertTrue(ex.getMessage().contains("not found"));
                assertTrue(ex.getMessage().contains("COSC"));

                verify(courseInterface, never()).addCourse(any());
                verify(courseInterface, never()).addSection(anyLong(), any());
        }

        @Test
        void testdeleteSectionReturnsAffectedCount() {
                long sectionId = 42L;
                when(allocatedSectionRepository.deleteAllBySectionId(sectionId)).thenReturn(7);
                Integer result = allocationService.deleteSection(sectionId);

                assertEquals(7, result);
        }

        @Test
        void testdeleteSectionReturnsZeroWhenNothingToDelete() {
                long sectionId = 99L;
                when(allocatedSectionRepository.deleteAllBySectionId(sectionId)).thenReturn(0);

                Integer result = allocationService.deleteSection(sectionId);

                assertEquals(0, result);
        }
}