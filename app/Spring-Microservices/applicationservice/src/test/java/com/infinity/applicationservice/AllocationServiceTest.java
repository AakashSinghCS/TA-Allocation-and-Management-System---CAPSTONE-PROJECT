package com.infinity.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import com.infinity.applicationservice.dtos.Allocations.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationRequest;
import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Courses.CourseDto;
import com.infinity.applicationservice.dtos.Courses.SectionDto;
import com.infinity.applicationservice.dtos.Users.StudentDto;
import com.infinity.applicationservice.enums.ApplicationStatus;
import com.infinity.applicationservice.enums.ApplicationType;
import com.infinity.applicationservice.enums.SectionType;
import com.infinity.applicationservice.exceptions.AuthorizationException;
import com.infinity.applicationservice.exceptions.BadRequestException;
import com.infinity.applicationservice.exceptions.NotFoundException;
import com.infinity.applicationservice.feign.SectionInterface;
import com.infinity.applicationservice.feign.UserInterface;
import com.infinity.applicationservice.models.Allocation;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.repositories.AllocationRepository;
import com.infinity.applicationservice.repositories.ApplicationRepository;
import com.infinity.applicationservice.services.AllocationService;
import com.infinity.applicationservice.utility.AllocationMapper;
import com.infinity.applicationservice.utility.ApplicationMapper;

import jakarta.persistence.EntityNotFoundException;

class AllocationServiceTest {

        private AllocationService allocationService;
        private AllocationRepository allocationRepository;
        private ApplicationRepository applicationRepository;
        private SectionInterface sectionInterface;
        private UserInterface userInterface;
        private ApplicationMapper applicationMapper;
        private AllocationMapper allocationMapper;

        @BeforeEach
        void setup() {
                allocationRepository = Mockito.mock(AllocationRepository.class);
                sectionInterface = Mockito.mock(SectionInterface.class);
                userInterface = Mockito.mock(UserInterface.class);
                applicationRepository = Mockito.mock(ApplicationRepository.class);
                applicationMapper = Mockito.mock(ApplicationMapper.class);
                allocationMapper = Mockito.mock(AllocationMapper.class);
                allocationService = new AllocationService(allocationRepository, applicationRepository, sectionInterface,
                                userInterface, applicationMapper, allocationMapper);
        }

        @Test
        void getAllocationsByStudentId_returnsMappedDtoList() {
                Long studentId = 1L;

                Application application = new Application();
                application.setId(1L);
                application.setStudentId(studentId);
                Allocation allocation = new Allocation();
                allocation.setId(101L);
                allocation.setStudentId(studentId);
                allocation.setStatus(ApplicationStatus.CONFIRMED);
                allocation.setNumberOfHours(10);
                allocation.setSectionId(1001L);
                allocation.setApplication(application);

                StudentDto studentDto = new StudentDto(1L, "Test", "User", 123456, "BSC", 2022, 4);
                SectionDto sectionDto = new SectionDto(1001L, 2025, "Fall", "T01", SectionType.TUTORIAL,
                                new CourseDto(1L, "COSC", "Capstone", "499"));
                ApplicationDto applicationDto = new ApplicationDto(1L, studentId, null, ApplicationType.UNDERGRADUATE,
                                false,
                                null, null, Set.of());
                AllocationHistoryDto expectedDto = new AllocationHistoryDto(101L, studentDto, applicationDto,
                                ApplicationStatus.CONFIRMED, 10,
                                sectionDto);

                when(allocationRepository.findByStudentId(studentId)).thenReturn(List.of(allocation));
                when(userInterface.getStudentById(studentId)).thenReturn(ResponseEntity.ok(studentDto));
                when(sectionInterface.getSectionById(1001L)).thenReturn(sectionDto);
                when(applicationMapper.toDto(application)).thenReturn(applicationDto);
                when(allocationMapper.toDto(allocation, studentDto, applicationDto, sectionDto))
                                .thenReturn(expectedDto);

                List<AllocationHistoryDto> result = allocationService.getAllocationsByStudentId(studentId);

                assertEquals(1, result.size());
                assertEquals(expectedDto, result.get(0));

                verify(allocationRepository).findByStudentId(studentId);
                verify(userInterface).getStudentById(studentId);
                verify(sectionInterface).getSectionById(1001L);
                verify(applicationMapper).toDto(application);
                verify(allocationMapper).toDto(allocation, studentDto, applicationDto, sectionDto);
        }

        @Test
        void testAllocateStudent_ThrowsIfAlreadyAllocated() {
                Long applicationId = 1L;
                Application application = new Application();
                application.setId(applicationId);
                application.setStudentId(1L);
                application.setSubmittedAt(LocalDateTime.now());
                when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
                when(allocationRepository.existsByApplicationIdAndSectionIdAndStudentId(1L, 2L, 3L))
                                .thenReturn(true);

                AllocationRequest request = new AllocationRequest(3L, 1L, ApplicationStatus.SENT, 10, 2L);

                assertThrows(BadRequestException.class, () -> allocationService.allocateStudent(request));
        }

        @Test
        void allocateStudent_returnsExpectedDto() {
                Long studentId = 1L;
                Long sectionId = 1001L;
                Long applicationId = 1L;

                AllocationRequest request = new AllocationRequest(
                                studentId,
                                applicationId,
                                ApplicationStatus.SENT,
                                5,
                                sectionId);

                Application application = new Application();
                application.setId(applicationId);
                application.setStudentId(studentId);
                application.setSubmittedAt(LocalDateTime.now());

                Allocation savedAllocation = new Allocation();
                savedAllocation.setId(500L);
                savedAllocation.setStudentId(studentId);
                savedAllocation.setStatus(ApplicationStatus.SENT);
                savedAllocation.setNumberOfHours(5);
                savedAllocation.setSectionId(sectionId);
                savedAllocation.setApplication(application);

                StudentDto studentDto = new StudentDto(studentId, "Test", "User", 63260442, "BSC", 2022, 4);
                SectionDto sectionDto = new SectionDto(sectionId, 2025, "Fall", "T01", SectionType.TUTORIAL,
                                new CourseDto(1L, "COSC", "Capstone", "499"));
                ApplicationDto applicationDto = new ApplicationDto(1L, studentId, null, ApplicationType.UNDERGRADUATE,
                                false,
                                null, LocalDateTime.now(), Set.of());
                AllocationHistoryDto expectedDto = new AllocationHistoryDto(500L, studentDto, applicationDto,
                                ApplicationStatus.SENT, 5,
                                sectionDto);

                when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
                when(allocationRepository.save(any(Allocation.class))).thenReturn(savedAllocation);
                when(userInterface.getStudentById(studentId)).thenReturn(ResponseEntity.ok(studentDto));
                when(sectionInterface.getSectionById(sectionId)).thenReturn(sectionDto);
                when(applicationMapper.toDto(application)).thenReturn(applicationDto);
                when(allocationMapper.toDto(savedAllocation, studentDto, applicationDto, sectionDto))
                                .thenReturn(expectedDto);

                AllocationHistoryDto result = allocationService.allocateStudent(request);

                assertNotNull(result);
                assertEquals(expectedDto, result);
                assertEquals(500L, result.id());
                assertEquals(studentId, result.student().id());
                assertEquals("Test", result.student().firstName());
                assertEquals("T01", result.section().section());
                assertEquals(result.status(), ApplicationStatus.SENT);

                verify(applicationRepository).findById(applicationId);
                verify(allocationRepository).save(any(Allocation.class));
                verify(userInterface).getStudentById(studentId);
                verify(sectionInterface).getSectionById(sectionId);
                verify(applicationMapper).toDto(application);
                verify(allocationMapper).toDto(savedAllocation, studentDto, applicationDto, sectionDto);
        }

        @Test
        void deallocateStudent_NotFound() {
                when(allocationRepository.existsById(any())).thenReturn(false);
                assertThrows(NotFoundException.class, () -> allocationService.deallocateStudent(1L));
        }

        @Test
        void deallocateStudent_Success() {
                when(allocationRepository.existsById(any())).thenReturn(true);
                String message = allocationService.deallocateStudent(1L);
                verify(allocationRepository).deleteById(1L);
                assertEquals(message, "Student deallocated");
        }

        @Test
        void acceptOffer_setsConfirmedTrue() {
                Long allocationId = 99L;
                Allocation allocation = new Allocation();
                allocation.setId(allocationId);
                allocation.setStatus(ApplicationStatus.SENT);

                when(allocationRepository.findById(allocationId)).thenReturn(Optional.of(allocation));

                allocationService.updateConfirmationStatus(allocationId, ApplicationStatus.CONFIRMED);

                assertEquals(allocation.getStatus(), ApplicationStatus.CONFIRMED);
                verify(allocationRepository).save(allocation);
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
                assertThrows(EntityNotFoundException.class, () -> allocationService.updateConfirmationStatus(123L,
                                ApplicationStatus.CONFIRMED));
        }

        @Test
        void denyOffer_throwsIfNotFound() {
                when(allocationRepository.findById(123L)).thenReturn(Optional.empty());
                assertThrows(EntityNotFoundException.class, () -> allocationService.updateConfirmationStatus(123L,
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
                                ApplicationStatus.REJECTED,
                                5,
                                sectionId);

                when(applicationRepository.findById(applicationId)).thenReturn(Optional.empty());

                assertThrows(EntityNotFoundException.class, () -> {
                        allocationService.allocateStudent(request);
                });

                verify(applicationRepository).findById(applicationId);
                verifyNoInteractions(allocationRepository, userInterface, sectionInterface);
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
                a1.setSectionId(1L);
                a2.setSectionId(1L);

                Application application = new Application();
                application.setId(1L);
                application.setStudentId(1L);
                application.setSubmittedAt(LocalDateTime.now());
                a1.setApplication(application);
                a2.setApplication(application);

                StudentDto studentDto = new StudentDto(1L, "Scoobert", "Doobert", null, null, null, null);
                SectionDto sectionDto = new SectionDto(1L, 2025, "Winter", "001", SectionType.LABORATORY,
                                new CourseDto(1L, "COSC", "capstone", "499"));
                ApplicationDto applicationDto = new ApplicationDto(1l, 1L, List.of(), ApplicationType.UNDERGRADUATE,
                                false, 6, LocalDateTime.now(), Set.of());

                AllocationHistoryDto expectedDto = new AllocationHistoryDto(1L, studentDto, applicationDto,
                                ApplicationStatus.CONFIRMED, 10, sectionDto);

                when(allocationRepository.findAll()).thenReturn(List.of(a1, a2));
                when(userInterface.getStudentById(1L)).thenReturn(ResponseEntity.ok(studentDto));
                when(sectionInterface.getSectionById(1L)).thenReturn(sectionDto);
                when(applicationMapper.toDto(application)).thenReturn(applicationDto);
                when(allocationMapper.toDto(a1, studentDto, applicationDto, sectionDto)).thenReturn(expectedDto);

                List<AllocationHistoryDto> result = allocationService
                                .getAllocationsByConfirmationStatus(ApplicationStatus.CONFIRMED);

                assertEquals(1, result.size());
                assertEquals(result.get(0).status(), ApplicationStatus.CONFIRMED);

                verify(allocationRepository).findAll();
                verify(userInterface).getStudentById(1L);
                verify(sectionInterface).getSectionById(1L);
                verify(applicationMapper).toDto(application);
                verify(allocationMapper).toDto(a1, studentDto, applicationDto, sectionDto);
        }

        @Test
        void getAllocationsBySectionId_returnsFilteredResults() {
                Long targetSectionId = 100L;

                Allocation a1 = new Allocation();
                a1.setId(1L);
                a1.setSectionId(targetSectionId);
                Allocation a2 = new Allocation();
                a2.setId(2L);
                a2.setSectionId(200L); // irrelevant section
                a1.setStudentId(1L);
                a2.setStudentId(1L);
                a1.setStatus(ApplicationStatus.CONFIRMED);
                a2.setStatus(ApplicationStatus.REJECTED);

                Application application = new Application();
                application.setId(1L);
                application.setStudentId(1L);
                application.setSubmittedAt(LocalDateTime.now());
                a1.setApplication(application);
                a2.setApplication(application);

                StudentDto studentDto = new StudentDto(1L, "Scoobert", "Doobert", null, null, null, null);
                SectionDto sectionDto = new SectionDto(100L, 2025, "Winter", "001", SectionType.LABORATORY,
                                new CourseDto(1L, "COSC", "capstone", "499"));
                ApplicationDto applicationDto = new ApplicationDto(1L, 1L, List.of(), ApplicationType.UNDERGRADUATE,
                                false, 6,
                                LocalDateTime.now(), Set.of());

                AllocationHistoryDto expectedDto = new AllocationHistoryDto(
                                1L,
                                studentDto,
                                applicationDto,
                                ApplicationStatus.REJECTED,
                                10,
                                sectionDto);

                when(allocationRepository.findAll()).thenReturn(List.of(a1, a2));
                when(userInterface.getStudentById(1L)).thenReturn(ResponseEntity.ok(studentDto));
                when(sectionInterface.getSectionById(targetSectionId)).thenReturn(sectionDto);
                when(applicationMapper.toDto(application)).thenReturn(applicationDto);
                when(allocationMapper.toDto(a1, studentDto, applicationDto, sectionDto)).thenReturn(expectedDto);

                List<AllocationHistoryDto> result = allocationService.getAllocationsBySectionId(targetSectionId);

                assertEquals(1, result.size());
                assertEquals(targetSectionId, result.get(0).section().id());

                verify(allocationRepository).findAll();
                verify(userInterface).getStudentById(1L);
                verify(sectionInterface).getSectionById(targetSectionId);
                verify(applicationMapper).toDto(application);
                verify(allocationMapper).toDto(a1, studentDto, applicationDto, sectionDto);
        }

        @Test
        void getAllocationsByApplicationId_NotAuthorized() {

                when(allocationRepository.existsByStudentIdAndApplicationId(1L, 1L)).thenReturn(false);

                assertThrows(AuthorizationException.class, () -> allocationService.getAllocationsByApplicationId(1L, 1L,
                                List.of("ROLE_STUDENT")));
        }

        @Test
        void getAllocationsByApplicationId_returnsFilteredResults() {
                Application app1 = new Application();
                app1.setId(1L);
                app1.setStudentId(1L);
                app1.setSubmittedAt(LocalDateTime.now());

                Application app2 = new Application();
                app2.setId(2L);
                app2.setStudentId(1L);
                app2.setSubmittedAt(LocalDateTime.now());

                Allocation a1 = new Allocation();
                a1.setId(1L);
                a1.setApplication(app1);
                a1.setStudentId(1L);
                a1.setSectionId(1L);

                Allocation a2 = new Allocation();
                a2.setId(2L);
                a2.setApplication(app2);
                a2.setStudentId(1L);
                a2.setSectionId(1L);

                StudentDto studentDto = new StudentDto(1L, "Scoobert", "Doobert", null, null, null, null);
                SectionDto sectionDto = new SectionDto(1L, 2025, "Winter", "001", SectionType.LABORATORY,
                                new CourseDto(1L, "COSC", "capstone", "499"));
                ApplicationDto applicationDto = new ApplicationDto(1L, 1L, List.of(), ApplicationType.UNDERGRADUATE,
                                false, 6, app1.getSubmittedAt(), Set.of());
                AllocationHistoryDto historyDto = new AllocationHistoryDto(1L, studentDto, applicationDto,
                                ApplicationStatus.CONFIRMED, 10, sectionDto);

                when(allocationRepository.findAll()).thenReturn(List.of(a1, a2));
                when(userInterface.getStudentById(1L)).thenReturn(ResponseEntity.ok(studentDto));
                when(sectionInterface.getSectionById(1L)).thenReturn(sectionDto);
                when(applicationMapper.toDto(app1)).thenReturn(applicationDto);
                when(allocationMapper.toDto(a1, studentDto, applicationDto, sectionDto)).thenReturn(historyDto);
                when(allocationRepository.existsByStudentIdAndApplicationId(1L, 1L)).thenReturn(true);

                List<AllocationHistoryDto> result = allocationService.getAllocationsByApplicationId(1L, 1L,
                                List.of("ROLE_COORDINATOR"));

                assertEquals(1, result.size());
                assertEquals(1L, result.get(0).applicationDto().studentId());
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
                a1.setSectionId(1L);

                Allocation a2 = new Allocation();
                a2.setId(2L);
                a2.setApplication(app2);
                a2.setStudentId(1L);
                a2.setSectionId(1L);

                StudentDto studentDto = new StudentDto(1L, "Scoobert", "Doobert", null, null, null, null);
                SectionDto sectionDto = new SectionDto(1L, 2025, "Winter", "001", SectionType.LABORATORY,
                                new CourseDto(1L, "COSC", "capstone", "499"));
                ApplicationDto applicationDto = new ApplicationDto(1L, 1L, List.of(), ApplicationType.UNDERGRADUATE,
                                false, 6, now, Set.of());
                AllocationHistoryDto historyDto = new AllocationHistoryDto(1L, studentDto, applicationDto,
                                ApplicationStatus.CONFIRMED, 10, sectionDto);

                when(allocationRepository.findAll()).thenReturn(List.of(a1, a2));
                when(userInterface.getStudentById(1L)).thenReturn(ResponseEntity.ok(studentDto));
                when(sectionInterface.getSectionById(1L)).thenReturn(sectionDto);
                when(applicationMapper.toDto(app1)).thenReturn(applicationDto);
                when(allocationMapper.toDto(a1, studentDto, applicationDto, sectionDto)).thenReturn(historyDto);

                List<AllocationHistoryDto> result = allocationService.getAllocationsByApplicationYear(2025);

                assertEquals(1, result.size());
                assertEquals(2025, result.get(0).applicationDto().timeSubmitted().getYear());
        }

        @Test
        void getAllocationsByStudentId_returnsMappedDtoList_whenApplicationExists() {
                Long studentId = 1L;

                Application application = new Application();
                application.setId(1L); // Important: simulate non-null application
                application.setStudentId(studentId);

                Allocation allocation = new Allocation();
                allocation.setId(101L);
                allocation.setStudentId(studentId);
                allocation.setStatus(ApplicationStatus.CONFIRMED);
                allocation.setNumberOfHours(10);
                allocation.setSectionId(1001L);
                allocation.setApplication(application);

                StudentDto studentDto = new StudentDto(1L, "Test", "User", 123456, "BSC", 2022, 4);
                SectionDto sectionDto = new SectionDto(1001L, 2025, "Fall", "T01", SectionType.TUTORIAL,
                        new CourseDto(1L, "COSC", "Capstone", "499"));
                ApplicationDto applicationDto = new ApplicationDto(1L, studentId, null, ApplicationType.UNDERGRADUATE,
                        false, null, null, Set.of());

                AllocationHistoryDto expectedDto = new AllocationHistoryDto(101L, studentDto, applicationDto,
                        ApplicationStatus.CONFIRMED, 10, sectionDto);

                when(allocationRepository.findByStudentId(studentId)).thenReturn(List.of(allocation));
                when(userInterface.getStudentById(studentId)).thenReturn(ResponseEntity.ok(studentDto));
                when(sectionInterface.getSectionById(1001L)).thenReturn(sectionDto);
                when(applicationMapper.toDto(application)).thenReturn(applicationDto);
                when(allocationMapper.toDto(allocation, studentDto, applicationDto, sectionDto)).thenReturn(expectedDto);

                List<AllocationHistoryDto> result = allocationService.getAllocationsByStudentId(studentId);

                assertEquals(1, result.size());
                assertEquals(expectedDto, result.get(0));

                verify(allocationRepository).findByStudentId(studentId);
                verify(userInterface).getStudentById(studentId);
                verify(sectionInterface).getSectionById(1001L);
                verify(applicationMapper).toDto(application);
                verify(allocationMapper).toDto(allocation, studentDto, applicationDto, sectionDto);
        }

        @Test
        void getAllocationsByStudentId_handlesNullApplication() {
                Long studentId = 1L;

                Allocation allocation = new Allocation();
                allocation.setId(101L);
                allocation.setStudentId(studentId);
                allocation.setStatus(ApplicationStatus.CONFIRMED);
                allocation.setNumberOfHours(10);
                allocation.setSectionId(1001L);
                allocation.setApplication(null); 

                StudentDto studentDto = new StudentDto(1L, "Test", "User", 123456, "BSC", 2022, 4);
                SectionDto sectionDto = new SectionDto(1001L, 2025, "Fall", "T01", SectionType.TUTORIAL,
                        new CourseDto(1L, "COSC", "Capstone", "499"));

                AllocationHistoryDto expectedDto = new AllocationHistoryDto(101L, studentDto, null,
                        ApplicationStatus.CONFIRMED, 10, sectionDto);

                when(allocationRepository.findByStudentId(studentId)).thenReturn(List.of(allocation));
                when(userInterface.getStudentById(studentId)).thenReturn(ResponseEntity.ok(studentDto));
                when(sectionInterface.getSectionById(1001L)).thenReturn(sectionDto);
                when(allocationMapper.toDto(allocation, studentDto, null, sectionDto)).thenReturn(expectedDto);

                List<AllocationHistoryDto> result = allocationService.getAllocationsByStudentId(studentId);

                assertEquals(1, result.size());
                assertEquals(expectedDto, result.get(0));

                verify(allocationRepository).findByStudentId(studentId);
                verify(userInterface).getStudentById(studentId);
                verify(sectionInterface).getSectionById(1001L);
                verify(allocationMapper).toDto(allocation, studentDto, null, sectionDto);
        }


}