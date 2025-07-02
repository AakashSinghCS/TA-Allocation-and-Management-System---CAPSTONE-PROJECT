package com.infinity.applicationservice;

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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AllocationServiceTest {

    private AllocationService allocationService;
    private AllocationRepository allocationRepository;
    private ApplicationRepository applicationRepository;
    private SectionInterface sectionInterface;
    private UserInterface userInterface;

    @BeforeEach
    void setup() {
        allocationRepository = Mockito.mock(AllocationRepository.class);
        sectionInterface = Mockito.mock(SectionInterface.class);
        userInterface = Mockito.mock(UserInterface.class);
        applicationRepository = Mockito.mock(ApplicationRepository.class);
        allocationService = new AllocationService(allocationRepository, applicationRepository, sectionInterface,
                userInterface);
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

        when(allocationRepository.findByStudentId(studentId))
                .thenReturn(List.of(allocation));
        when(userInterface.getStudentById(1L))
                .thenReturn(ResponseEntity
                        .ok(new StudentDto(1L, "Test User", "test@example.com", 63260442, "BSC", 2022, 4)));
        when(sectionInterface.getSectionById(1001L))
                .thenReturn(new SectionDto(1001L, "Fall", "T01", SectionType.TUTORIAL,
                        new CourseDto("COSC", "Capstone", "499")));

        List<AllocationHistoryDto> result = allocationService.getAllocationsByStudentId(studentId);

        assertEquals(1, result.size());
        AllocationHistoryDto dto = result.get(0);
        assertEquals(101L, dto.id());
        assertEquals(10, dto.numberOfHours());
        assertTrue(dto.isConfirmed());
        assertEquals("Test User", dto.student().firstName());
        assertEquals("T01", dto.section().section());

        verify(allocationRepository).findByStudentId(studentId);
        verify(userInterface).getStudentById(1L);
        verify(sectionInterface).getSectionById(1001L);
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
                sectionId);

        Application application = new Application();
        application.setId(applicationId);

        when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(application));

        Allocation savedAllocation = new Allocation();
        savedAllocation.setId(500L);
        savedAllocation.setStudentId(studentId);
        savedAllocation.setConfirmed(true);
        savedAllocation.setNumberOfHours(5);
        savedAllocation.setSectionId(sectionId);
        savedAllocation.setApplication(application);

        StudentDto studentDto = new StudentDto(studentId, "Test", "User", 63260442, "BSC", 2022, 4);
        SectionDto sectionDto = new SectionDto(
                sectionId,
                "Fall",
                "T01",
                SectionType.TUTORIAL,
                new CourseDto("COSC", "Capstone", "499"));

        when(allocationRepository.save(any(Allocation.class))).thenReturn(savedAllocation);
        when(userInterface.getStudentById(studentId)).thenReturn(ResponseEntity.ok(studentDto));
        when(sectionInterface.getSectionById(sectionId)).thenReturn(sectionDto);

        AllocationHistoryDto result = allocationService.allocateStudent(request);

        assertNotNull(result);
        assertEquals(500L, result.id());
        assertEquals(studentId, result.student().id());
        assertEquals("Test", result.student().firstName());
        assertEquals("T01", result.section().section());
        assertTrue(result.isConfirmed());
        assertEquals(5, result.numberOfHours());

        verify(allocationRepository).save(any(Allocation.class));
        verify(applicationRepository).findById(applicationId);
        verify(userInterface).getStudentById(studentId);
        verify(sectionInterface).getSectionById(sectionId);
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
        assertThrows(EntityNotFoundException.class, () -> allocationService.updateConfirmationStatus(123L, true));
    }

    @Test
    void denyOffer_throwsIfNotFound() {
        when(allocationRepository.findById(123L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> allocationService.updateConfirmationStatus(123L, false));
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
                sectionId);

        when(applicationRepository.findById(applicationId)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> {
            allocationService.allocateStudent(request);
        });

        verify(applicationRepository).findById(applicationId);
        verifyNoInteractions(allocationRepository, userInterface, sectionInterface);
    }

    @Test
    public void getAllocationsBySectionId_MapsEntitiesToDtos() {
        // given
        Allocation alloc = new Allocation();
        alloc.setId(42L);
        alloc.setStudentId(7L);
        alloc.setConfirmed(true);
        alloc.setNumberOfHours(10);
        alloc.setSectionId(99L);
        when(allocationRepository.findBySectionId(99L)).thenReturn(List.of(alloc));

        StudentDto studentDto = new StudentDto(7L, "Jane", "Doe",  12345, "CS", 2021, 4);
        when(userInterface.getStudentById(7L)).thenReturn(ResponseEntity.ok(studentDto));

        SectionDto sectionDto = new SectionDto(99L, "term","section",SectionType.LECTURE, new CourseDto("COSC", "CS", "112"));
        when(sectionInterface.getSectionById(99L)).thenReturn(sectionDto);

        // when
        List<AllocationDto> result = allocationService.getAllocationsBySectionId(99L);

        // then
        assertEquals(1, result.size());
        AllocationDto dto = result.get(0);
        assertEquals(42L, dto.id());
        assertEquals(studentDto, dto.student());
        assertTrue(dto.isConfirmed());
        assertEquals(10, dto.numberOfHours());
        assertEquals(sectionDto, dto.section());
    }
}