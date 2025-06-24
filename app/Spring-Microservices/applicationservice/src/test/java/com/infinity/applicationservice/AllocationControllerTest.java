package com.infinity.applicationservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.applicationservice.controllers.AllocationController;
import com.infinity.applicationservice.dtos.*;
import com.infinity.applicationservice.enums.*;
import com.infinity.applicationservice.services.AllocationService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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
        sampleDto = new AllocationHistoryDto(
            101L,
            new StudentDto(1L, "Test User", "test@example.com", 63260442, "BSC", 2022, 4),
            new OfferDto(1L, true, "I accept the offer"),
            true,
            10,
            new SectionDto(1001L, "Fall", "T01", SectionType.TUTORIAL, new CourseDto("COSC","Capstone","499"))
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
            .andExpect(jsonPath("$[0].offer.id").value(1))
            .andExpect(jsonPath("$[0].offer.isAccepted").value(true))
            .andExpect(jsonPath("$[0].offer.description").value("I accept the offer"));
    }

    @Test
    void allocateStudent_createsAllocationAndReturnsDto() throws Exception {
        AllocationRequest request = new AllocationRequest(
            1L,
            1L,
            true,
            10,
            1001L
        );

        AllocationHistoryDto responseDto = new AllocationHistoryDto(
            123L,
            new StudentDto(1L, "Test", "test@example.com", 63260442, "BSC", 2022, 4),
            new OfferDto(1L, true, "I accept the offer"),
            true,
            10,
            new SectionDto(1001L, "Fall", "T01", SectionType.TUTORIAL, new CourseDto("COSC","Capstone","499"))
        );

        when(allocationService.allocateStudent(any(AllocationRequest.class))).thenReturn(responseDto);

        mvc.perform(post("/allocations/allocate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(123))
            .andExpect(jsonPath("$.student.firstName").value("Test"))
            .andExpect(jsonPath("$.numberOfHours").value(10))
            .andExpect(jsonPath("$.section.section").value("T01"))
            .andExpect(jsonPath("$.offer.id").value(1))
            .andExpect(jsonPath("$.offer.isAccepted").value(true))
            .andExpect(jsonPath("$.offer.description").value("I accept the offer"));
    }

}