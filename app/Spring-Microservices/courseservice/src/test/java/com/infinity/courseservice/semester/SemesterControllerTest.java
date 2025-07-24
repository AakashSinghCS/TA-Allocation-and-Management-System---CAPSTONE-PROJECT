package com.infinity.courseservice.semester;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.infinity.courseservice.controllers.SemesterController;
import com.infinity.courseservice.dtos.Semesters.SemesterDto;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.services.SemesterService;

@WebMvcTest(SemesterController.class)
@AutoConfigureMockMvc(addFilters = false)
class SemesterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SemesterService semesterService;

    private ObjectMapper mapper = new ObjectMapper();

    private SemesterDto validDto;

    @BeforeEach
    void setUp() {
        validDto = new SemesterDto(1L, 2025, "W1",
                LocalDate.of(2025, 9, 1), LocalDate.of(2025, 12, 1));
        mapper.registerModule(new JavaTimeModule());
    }

    @Test
    void addSemester_validRequest_returnsSemester() throws Exception {
        when(semesterService.addSemester(any(SemesterDto.class))).thenReturn(validDto);

        mockMvc.perform(post("/semesters/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(validDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.year").value(2025))
                .andExpect(jsonPath("$.semester").value("W1"));
    }

    @Test
    void addSemester_invalidDates_returnsBadRequest() throws Exception {
        SemesterDto badDto = new SemesterDto(1L, 2025, "W1",
                LocalDate.of(2025, 12, 1), LocalDate.of(2025, 9, 1));

        doThrow(new BadRequestException("Start date must be before end date"))
                .when(semesterService).addSemester(any(SemesterDto.class));

        mockMvc.perform(post("/semesters/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(badDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getSemesterById_returnsSemester() throws Exception {
        when(semesterService.getSemesterById(1L)).thenReturn(validDto);

        mockMvc.perform(get("/semesters/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.semester").value("W1"));
    }

    @Test
    void getAllSemesters_returnsList() throws Exception {
        when(semesterService.getAllSemesters()).thenReturn(List.of(validDto));

        mockMvc.perform(get("/semesters/getAll"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void updateSemester_validRequest_returnsUpdatedDto() throws Exception {
        SemesterDto updateDto = new SemesterDto(1L, 2025, "W2",
            LocalDate.of(2025, 9, 5), LocalDate.of(2025, 12, 5));

        when(semesterService.updateSemester(eq(1L), any())).thenReturn(updateDto);

        mockMvc.perform(put("/semesters/update/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(updateDto)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.semester").value("W2"));
    }

    @Test
    void deleteSemester_existingId_returnsConfirmation() throws Exception {
        when(semesterService.deleteSemester(1L)).thenReturn("Semester deleted");

        mockMvc.perform(delete("/semesters/delete/1"))
            .andExpect(status().isOk())
            .andExpect(content().string("Semester deleted"));
    }
}
