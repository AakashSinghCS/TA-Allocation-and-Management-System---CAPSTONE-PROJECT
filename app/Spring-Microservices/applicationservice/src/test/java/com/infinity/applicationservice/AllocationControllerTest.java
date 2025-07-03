package com.infinity.applicationservice;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.applicationservice.controllers.AllocationController;
import com.infinity.applicationservice.dtos.Allocations.AllocationHistoryDto;
import com.infinity.applicationservice.dtos.Allocations.AllocationRequest;
import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Courses.CourseDto;
import com.infinity.applicationservice.dtos.Courses.SectionDto;
import com.infinity.applicationservice.dtos.Users.StudentDto;
import com.infinity.applicationservice.enums.ApplicationType;
import com.infinity.applicationservice.enums.SectionType;
import com.infinity.applicationservice.services.AllocationService;


@WebMvcTest(AllocationController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AllocationControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @MockitoBean
    private AllocationService allocationService;

    private AllocationHistoryDto sampleDto;

    @BeforeEach
    void setup() {
        ApplicationDto application = new ApplicationDto(
            1L,
            1L,
            List.of(),
            ApplicationType.UNDERGRADUATE,
            false,
            10,
            LocalDateTime.of(2025, 7, 1, 12, 0),
            Set.of()
        );
        sampleDto = new AllocationHistoryDto(
            101L,
            new StudentDto(1L, "Test User", "test@example.com", 63260442, "BSC", 2022, 4),
            application,
            false,
            10,
            new SectionDto(1001L, 2025, "Fall", "T01", SectionType.TUTORIAL, new CourseDto(1L, "COSC","Capstone","499"))
        );
    }

    @Test
    void testGetStudentAllocationHistory() throws Exception {
        Long sid = 1L;
        when(allocationService.getAllocationsByStudentId(sid)).thenReturn(List.of(sampleDto));

        mvc.perform(get("/allocations/student/{sid}/history", sid))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].id").value(101))
            .andExpect(jsonPath("$[0].student.firstName").value("Test User"))
            .andExpect(jsonPath("$[0].section.section").value("T01"))
            .andExpect(jsonPath("$[0].isConfirmed").value(false));
    }

    @Test
    void allocateStudent_createsAllocationAndReturnsDto() throws Exception {
        AllocationRequest request = new AllocationRequest(
                1L,
                1L,
                true,
                10,
                1001L);
        ApplicationDto application = new ApplicationDto(
                1L,
                1L,
                List.of(),
                ApplicationType.UNDERGRADUATE,
                false,
                10,
                LocalDateTime.now(),
                Set.of());

        AllocationHistoryDto responseDto = new AllocationHistoryDto(
                123L,
                new StudentDto(1L, "Test", "test@example.com", 63260442, "BSC", 2022, 4),
                application,
                false,
                10,
                new SectionDto(1001L, 2025, "Fall", "T01", SectionType.TUTORIAL,
                        new CourseDto(1L, "COSC", "Capstone", "499")));

        when(allocationService.allocateStudent(any(AllocationRequest.class))).thenReturn(responseDto);

        mvc.perform(post("/allocations/allocate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(123))
                .andExpect(jsonPath("$.student.firstName").value("Test"))
                .andExpect(jsonPath("$.numberOfHours").value(10))
                .andExpect(jsonPath("$.section.section").value("T01"))
                .andExpect(jsonPath("$.isConfirmed").value(false));
    }

    @Test
    void deallocateStudent_removesAllocationAndReturnsMessage() throws Exception {
        Long allocationId = 101L;
        String expectedResponse = "Student deallocated";

        when(allocationService.deallocateStudent(allocationId)).thenReturn(expectedResponse);

        mvc.perform(delete("/allocations/deallocate/{allocationId}", allocationId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").value(expectedResponse));

        verify(allocationService, times(1)).deallocateStudent(allocationId);
    }

    @Test
    void acceptOffer_updatesConfirmationStatusToTrue() throws Exception {
        doNothing().when(allocationService).updateConfirmationStatus(123L, true);

        mvc.perform(put("/allocations/123/acceptOffer"))
            .andExpect(status().isOk());

        verify(allocationService, times(1)).updateConfirmationStatus(123L, true);
    }

    @Test
    void denyOffer_updatesConfirmationStatusToFalse() throws Exception {
        doNothing().when(allocationService).updateConfirmationStatus(123L, false);

        mvc.perform(put("/allocations/123/denyOffer"))
            .andExpect(status().isOk());

        verify(allocationService, times(1)).updateConfirmationStatus(123L, false);
    }

    @Test
    void getAllocationsByConfirmationStatus_returnsFilteredResults() throws Exception {
        sampleDto = new AllocationHistoryDto(
        sampleDto.id(),
        sampleDto.student(),
        sampleDto.applicationDto(),
        true,
        sampleDto.numberOfHours(),
        sampleDto.section()
    );
        when(allocationService.getAllocationsByConfirmationStatus(true)).thenReturn(List.of(sampleDto));

        mvc.perform(get("/allocations/filter/confirmed/true"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].id").value(sampleDto.id()))
            .andExpect(jsonPath("$[0].isConfirmed").value(true));

        verify(allocationService, times(1)).getAllocationsByConfirmationStatus(true);
    }

    @Test
    void getAllocationsBySectionId_returnsFilteredResults() throws Exception {
        when(allocationService.getAllocationsBySectionId(1001L)).thenReturn(List.of(sampleDto));

        mvc.perform(get("/allocations/filter/section/1001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].section.id").value(1001L));

        verify(allocationService, times(1)).getAllocationsBySectionId(1001L);
    }

    @Test
    void getAllocationsByApplicationId_returnsFilteredResults() throws Exception {
        when(allocationService.getAllocationsByApplicationId(55L, 1L, List.of("ROLE_COORDINATOR"))).thenReturn(List.of(sampleDto));

        mvc.perform(get("/allocations/filter/application/55"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].applicationDto").exists());

        verify(allocationService, times(1)).getAllocationsByApplicationId(55L, 1L, List.of("ROLE_COORDINATOR"));
    }

    @Test
    void getAllocationsByYear_returnsFilteredResults() throws Exception {
        when(allocationService.getAllocationsByApplicationYear(eq(2025))).thenReturn(List.of(sampleDto));

        mvc.perform(get("/allocations/filter/year/2025"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].applicationDto.timeSubmitted").value(org.hamcrest.Matchers.startsWith("2025")));
    }

}