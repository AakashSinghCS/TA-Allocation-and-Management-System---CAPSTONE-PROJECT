package com.infinity.applicationservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.ResponseEntity;

import com.infinity.applicationservice.dtos.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.AllocationRequest;
import com.infinity.applicationservice.dtos.CourseDto;
import com.infinity.applicationservice.dtos.SectionDto;
import com.infinity.applicationservice.dtos.StudentDto;
import com.infinity.applicationservice.enums.SectionType;
import com.infinity.applicationservice.feign.SectionInterface;
import com.infinity.applicationservice.feign.UserInterface;
import com.infinity.applicationservice.models.Allocation;
import com.infinity.applicationservice.models.Offer;
import com.infinity.applicationservice.repositories.AllocationRepository;
import com.infinity.applicationservice.services.AllocationService;

class AllocationServiceTest {

    private AllocationService allocationService;
    private AllocationRepository allocationRepository;
    private SectionInterface sectionInterface;
    private UserInterface userInterface;

    @BeforeEach
    void setup() {
        allocationRepository = Mockito.mock(AllocationRepository.class);
        sectionInterface = Mockito.mock(SectionInterface.class);
        userInterface = Mockito.mock(UserInterface.class);
        allocationService = new AllocationService(allocationRepository, sectionInterface, userInterface);
    }

    @Test
    void getAllocationsByStudentId_returnsMappedDtoList() {
        Long studentId = 1L;

        Allocation allocation = new Allocation();
        allocation.setId(101L);
        allocation.setStudentId(studentId);
        allocation.setOffer(new Offer());
        allocation.setConfirmed(true);
        allocation.setNumberOfHours(10);
        allocation.setSectionId(1001L);

        when(allocationRepository.findByStudentId(studentId))
            .thenReturn(List.of(allocation));
        when(userInterface.getStudentById(1L))
            .thenReturn(ResponseEntity.ok(new StudentDto(1L, "Test User", "test@example.com", 63260442, "BSC", 2022, 4)));
        when(sectionInterface.getSectionById(1001L))
            .thenReturn(new SectionDto(1001L, "Fall", "T01", SectionType.TUTORIAL, new CourseDto("COSC","Capstone","499")));

        List<AllocationHistoryDto> result = allocationService.getAllocationsByStudentId(studentId);

        assertEquals(1, result.size());
        AllocationHistoryDto dto = result.get(0);
        assertEquals(101L, dto.id());
        assertEquals(10, dto.numberOfHours());
        assertTrue(dto.isConfirmed());
        assertEquals("Test User", dto.student().firstName());

        verify(allocationRepository).findByStudentId(studentId);
        verify(userInterface).getStudentById(1L);
        verify(sectionInterface).getSectionById(1001L);
    }

    @Test
    void allocateStudent_returnsExpectedDto() {
        Long studentId = 1L;
        Long sectionId = 1001L;
        Long offerId = 1L;

        AllocationRequest request = new AllocationRequest(
            studentId,
            offerId,
            true,
            5,
            sectionId
        );

        Allocation savedAllocation = new Allocation();
        savedAllocation.setId(500L);
        savedAllocation.setStudentId(studentId);
        savedAllocation.setOffer(new Offer());
        savedAllocation.setConfirmed(true);
        savedAllocation.setNumberOfHours(5);
        savedAllocation.setSectionId(sectionId);

        StudentDto studentDto = new StudentDto(studentId, "Test", "User", 63260442, "BSC", 2022, 4);
        SectionDto sectionDto = new SectionDto(
            sectionId,
            "Fall",
            "T01",
            SectionType.TUTORIAL,
            new CourseDto("COSC","Capstone","499")
        );

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
        verify(userInterface).getStudentById(studentId);
        verify(sectionInterface).getSectionById(sectionId);
    }

}