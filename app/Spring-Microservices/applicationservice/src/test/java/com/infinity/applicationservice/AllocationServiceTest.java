package com.infinity.applicationservice;

import com.infinity.applicationservice.utility.AllocationMapper;
import com.infinity.applicationservice.utility.ApplicationMapper;
import com.infinity.applicationservice.dtos.*;
import com.infinity.applicationservice.enums.*;
import com.infinity.applicationservice.feign.SectionInterface;
import com.infinity.applicationservice.feign.UserInterface;
import com.infinity.applicationservice.models.Allocation;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.repositories.AllocationRepository;
import com.infinity.applicationservice.repositories.ApplicationRepository;
import com.infinity.applicationservice.services.AllocationService;


import jakarta.persistence.EntityNotFoundException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;


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
        allocationService = new AllocationService(allocationRepository, applicationRepository, sectionInterface, userInterface, applicationMapper, allocationMapper);
    }

    @Test
    void getAllocationsByStudentId_returnsMappedDtoList() {
        Long studentId = 1L;

        Application application = new Application();
        application.setStudentId(studentId);
        Allocation allocation = new Allocation();
        allocation.setId(101L);
        allocation.setStudentId(studentId);
        allocation.setConfirmed(true);
        allocation.setNumberOfHours(10);
        allocation.setSectionId(1001L);
        allocation.setApplication(application);

        StudentDto studentDto = new StudentDto(1L, "Test", "User", 123456, "BSC", 2022, 4);
        SectionDto sectionDto = new SectionDto(1001L, "Fall", "T01", SectionType.TUTORIAL, new CourseDto("COSC","Capstone","499"));
        ApplicationDto applicationDto = new ApplicationDto(studentId, null, false, null, null, Set.of());
        AllocationHistoryDto expectedDto = new AllocationHistoryDto(101L, studentDto, applicationDto, true, 10, sectionDto);

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
    void allocateStudent_returnsExpectedDto() {
        Long studentId = 1L;
        Long sectionId = 1001L;
        Long applicationId = 1L;

        AllocationRequest request = new AllocationRequest(
            studentId,
            applicationId,
            true,
            5,
            sectionId
        );

        Application application = new Application();
        application.setId(applicationId);
        application.setStudentId(studentId);
        application.setSubmittedAt(LocalDateTime.now());

        Allocation savedAllocation = new Allocation();
        savedAllocation.setId(500L);
        savedAllocation.setStudentId(studentId);
        savedAllocation.setConfirmed(false); // initially false
        savedAllocation.setNumberOfHours(5);
        savedAllocation.setSectionId(sectionId);
        savedAllocation.setApplication(application);

        StudentDto studentDto = new StudentDto(studentId, "Test", "User", 63260442, "BSC", 2022, 4);
        SectionDto sectionDto = new SectionDto(sectionId, "Fall", "T01", SectionType.TUTORIAL, new CourseDto("COSC", "Capstone", "499"));
        ApplicationDto applicationDto = new ApplicationDto(studentId, null, false, null, LocalDateTime.now(), Set.of());
        AllocationHistoryDto expectedDto = new AllocationHistoryDto(500L, studentDto, applicationDto, false, 5, sectionDto);


        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));
        when(allocationRepository.save(any(Allocation.class))).thenReturn(savedAllocation);
        when(userInterface.getStudentById(studentId)).thenReturn(ResponseEntity.ok(studentDto));
        when(sectionInterface.getSectionById(sectionId)).thenReturn(sectionDto);
        when(applicationMapper.toDto(application)).thenReturn(applicationDto);
        when(allocationMapper.toDto(savedAllocation, studentDto, applicationDto, sectionDto)).thenReturn(expectedDto);

        AllocationHistoryDto result = allocationService.allocateStudent(request);

        assertNotNull(result);
        assertEquals(expectedDto, result);
        assertEquals(500L, result.id());
        assertEquals(studentId, result.student().id());
        assertEquals("Test", result.student().firstName());
        assertEquals("T01", result.section().section());
        assertFalse(result.isConfirmed()); // since default isConfirmed = false

        verify(applicationRepository).findById(applicationId);
        verify(allocationRepository).save(any(Allocation.class));
        verify(userInterface).getStudentById(studentId);
        verify(sectionInterface).getSectionById(sectionId);
        verify(applicationMapper).toDto(application);
        verify(allocationMapper).toDto(savedAllocation, studentDto, applicationDto, sectionDto);
    }

    @Test
    void acceptOffer_setsConfirmedTrue() {
        Long allocationId = 99L;
        Allocation allocation = new Allocation();
        allocation.setId(allocationId);
        allocation.setConfirmed(false);

        when(allocationRepository.findById(allocationId)).thenReturn(Optional.of(allocation));

        allocationService.updateConfirmationStatus(allocationId, true);

        assertTrue(allocation.isConfirmed());
        verify(allocationRepository).save(allocation);
    }

    @Test
    void denyOffer_setsConfirmedFalse() {
        Long allocationId = 100L;
        Allocation allocation = new Allocation();
        allocation.setId(allocationId);
        allocation.setConfirmed(true);

        when(allocationRepository.findById(allocationId)).thenReturn(Optional.of(allocation));

        allocationService.updateConfirmationStatus(allocationId, false);

        assertFalse(allocation.isConfirmed());
        verify(allocationRepository).save(allocation);
    }

    @Test
    void acceptOffer_throwsIfNotFound() {
        when(allocationRepository.findById(123L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> allocationService.updateConfirmationStatus(123L,true));
    }

    @Test
    void denyOffer_throwsIfNotFound() {
        when(allocationRepository.findById(123L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> allocationService.updateConfirmationStatus(123L,false));
    }

    @Test
    void allocateStudent_throwsIfApplicationNotFound() {
        Long studentId = 1L;
        Long sectionId = 1001L;
        Long applicationId = 99L;

        AllocationRequest request = new AllocationRequest(
            studentId,
            applicationId,
            true,
            5,
            sectionId
        );

        when(applicationRepository.findById(applicationId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            allocationService.allocateStudent(request);
        });

        verify(applicationRepository).findById(applicationId);
        verifyNoInteractions(allocationRepository, userInterface, sectionInterface);
    }

    @Test
    void getAllocationsByConfirmationStatus_returnsFilteredResults() {
        Allocation a1 = new Allocation(); a1.setId(1L); a1.setConfirmed(true);
        Allocation a2 = new Allocation(); a2.setId(2L); a2.setConfirmed(false);
        a1.setStudentId(1L); a2.setStudentId(1L);
        a1.setSectionId(1L); a2.setSectionId(1L);

        Application application = new Application();
        application.setStudentId(1L);
        application.setSubmittedAt(LocalDateTime.now());
        a1.setApplication(application);
        a2.setApplication(application);

        StudentDto studentDto = new StudentDto(1L, "Scoobert", "Doobert", null, null, null, null);
        SectionDto sectionDto = new SectionDto(1L, "Winter", "001", SectionType.LABORATORY, new CourseDto("COSC", "capstone", "499"));
        ApplicationDto applicationDto = new ApplicationDto(1L, List.of(), false, 6, LocalDateTime.now(), Set.of());

        AllocationHistoryDto expectedDto = new AllocationHistoryDto(1L, studentDto, applicationDto, true, 10, sectionDto);

        when(allocationRepository.findAll()).thenReturn(List.of(a1, a2));
        when(userInterface.getStudentById(1L)).thenReturn(ResponseEntity.ok(studentDto));
        when(sectionInterface.getSectionById(1L)).thenReturn(sectionDto);
        when(applicationMapper.toDto(application)).thenReturn(applicationDto);
        when(allocationMapper.toDto(a1, studentDto, applicationDto, sectionDto)).thenReturn(expectedDto);

        List<AllocationHistoryDto> result = allocationService.getAllocationsByConfirmationStatus(true);

        assertEquals(1, result.size());
        assertTrue(result.get(0).isConfirmed());

        verify(allocationRepository).findAll();
        verify(userInterface).getStudentById(1L);
        verify(sectionInterface).getSectionById(1L);
        verify(applicationMapper).toDto(application);
        verify(allocationMapper).toDto(a1, studentDto, applicationDto, sectionDto);
    }


    @Test
    void getAllocationsBySectionId_returnsFilteredResults() {
        Long targetSectionId = 100L;

        Allocation a1 = new Allocation(); a1.setId(1L); a1.setSectionId(targetSectionId);
        Allocation a2 = new Allocation(); a2.setId(2L); a2.setSectionId(200L); // irrelevant section
        a1.setStudentId(1L); a2.setStudentId(1L);
        a1.setConfirmed(true); a2.setConfirmed(true);

        Application application = new Application(); 
        application.setStudentId(1L); 
        application.setSubmittedAt(LocalDateTime.now());
        a1.setApplication(application); 
        a2.setApplication(application);

        StudentDto studentDto = new StudentDto(1L, "Scoobert", "Doobert", null, null, null, null);
        SectionDto sectionDto = new SectionDto(100L, "Winter", "001", SectionType.LABORATORY, new CourseDto("COSC", "capstone", "499"));
        ApplicationDto applicationDto = new ApplicationDto(1L, List.of(), false, 6, LocalDateTime.now(), Set.of());

        AllocationHistoryDto expectedDto = new AllocationHistoryDto(
            1L,
            studentDto,
            applicationDto,
            true,
            10,
            sectionDto
        );

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
        SectionDto sectionDto = new SectionDto(1L, "Winter", "001", SectionType.LABORATORY, new CourseDto("COSC", "capstone", "499"));
        ApplicationDto applicationDto = new ApplicationDto(1L, List.of(), false, 6, app1.getSubmittedAt(), Set.of());
        AllocationHistoryDto historyDto = new AllocationHistoryDto(1L, studentDto, applicationDto, true, 10, sectionDto);

        when(allocationRepository.findAll()).thenReturn(List.of(a1, a2));
        when(userInterface.getStudentById(1L)).thenReturn(ResponseEntity.ok(studentDto));
        when(sectionInterface.getSectionById(1L)).thenReturn(sectionDto);
        when(applicationMapper.toDto(app1)).thenReturn(applicationDto);
        when(allocationMapper.toDto(a1, studentDto, applicationDto, sectionDto)).thenReturn(historyDto);

        List<AllocationHistoryDto> result = allocationService.getAllocationsByApplicationId(1L);

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).applicationDto().studentId());
    }


    @Test
    void getAllocationsByApplicationYear_returnsFilteredResults() {
        LocalDateTime now = LocalDateTime.of(2025, 7, 1, 10, 0);

        Application app1 = new Application(); 
        app1.setStudentId(1L); 
        app1.setSubmittedAt(now);

        Application app2 = new Application(); 
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
        SectionDto sectionDto= new SectionDto(1L, "Winter", "001", SectionType.LABORATORY, new CourseDto("COSC", "capstone", "499"));
        ApplicationDto applicationDto = new ApplicationDto(1L, List.of(), false, 6, now, Set.of());
        AllocationHistoryDto historyDto = new AllocationHistoryDto(1L, studentDto, applicationDto, true, 10, sectionDto);

        when(allocationRepository.findAll()).thenReturn(List.of(a1, a2));
        when(userInterface.getStudentById(1L)).thenReturn(ResponseEntity.ok(studentDto));
        when(sectionInterface.getSectionById(1L)).thenReturn(sectionDto);
        when(applicationMapper.toDto(app1)).thenReturn(applicationDto);
        when(allocationMapper.toDto(a1, studentDto, applicationDto, sectionDto)).thenReturn(historyDto);

        List<AllocationHistoryDto> result = allocationService.getAllocationsByApplicationYear(2025);

        assertEquals(1, result.size());
        assertEquals(2025, result.get(0).applicationDto().timeSubmitted().getYear());
    }


}