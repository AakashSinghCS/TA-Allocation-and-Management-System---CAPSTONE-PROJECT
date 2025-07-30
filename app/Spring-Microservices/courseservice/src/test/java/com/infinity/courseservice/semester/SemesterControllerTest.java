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
                LocalDate.of(2025, 9, 1), LocalDate.of(2025, 12, 1), true);
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
                LocalDate.of(2025, 12, 1), LocalDate.of(2025, 9, 1), true);

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
            LocalDate.of(2025, 9, 5), LocalDate.of(2025, 12, 5), true);

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
    
    @Test
    void getSemesterByYearAndSemester_returnsOk() throws Exception {
        SemesterDto dto = new SemesterDto(1L, 2025, "W1", LocalDate.of(2025, 9, 1), LocalDate.of(2025, 12, 1), true);
        when(semesterService.getSemesterByYearAndSemester(2025, "W1")).thenReturn(dto);

        mockMvc.perform(get("/semesters/2025/W1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.year").value(2025))
                .andExpect(jsonPath("$.semester").value("W1"));
    }

    @Test
    void getAllFutureSemesters_returnsList() throws Exception {
        SemesterDto dto = new SemesterDto(1L, 2026, "W1", LocalDate.now().plusDays(30), LocalDate.now().plusDays(120),
                true);
        when(semesterService.getAllFutureSemesters()).thenReturn(List.of(dto));

        mockMvc.perform(get("/semesters/getAllFuture"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].year").value(2026))
                .andExpect(jsonPath("$[0].semester").value("W1"));
    }
    
    @Test
    void getActiveSemesters_returns200AndList() throws Exception {
        SemesterDto dto = new SemesterDto(1L, 2025, "W1", LocalDate.of(2025, 9, 3), LocalDate.of(2025, 12, 8), true);
        when(semesterService.getSemestersByState(true)).thenReturn(List.of(dto));

        mockMvc.perform(get("/semesters/getActive"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].semester").value("W1"));
    }

    @Test
    void getInactiveSemesters_returns200AndList() throws Exception {
        SemesterDto dto = new SemesterDto(1L, 2024, "S1", LocalDate.of(2024, 5, 1), LocalDate.of(2024, 8, 15), false);
        when(semesterService.getSemestersByState(false)).thenReturn(List.of(dto));

        mockMvc.perform(get("/semesters/getInactive"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].semester").value("S1"));
    }
}
