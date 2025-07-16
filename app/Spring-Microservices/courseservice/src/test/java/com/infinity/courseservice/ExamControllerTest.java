package com.infinity.courseservice;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.courseservice.controllers.ExamController;
import com.infinity.courseservice.dtos.ExamDtos.ExamAssignmentDto;
import com.infinity.courseservice.dtos.ExamDtos.ExamAvailabilityDto;
import com.infinity.courseservice.dtos.ExamDtos.ExamDto;
import com.infinity.courseservice.enums.ExamTask;
import com.infinity.courseservice.services.ExamService;

@WebMvcTest(ExamController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ExamControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ExamService examService;

    @Autowired
    private ObjectMapper objectMapper;

    // -------------------
    // Exam CRUD
    // -------------------

    @Test
    void testCreateExam() throws Exception {
        ExamDto request = new ExamDto(null, 1L, LocalDate.of(2025, 8, 1), LocalTime.of(9, 0), LocalTime.of(12, 0));
        ExamDto response = new ExamDto(10L, 1L, request.date(), request.startTime(), request.endTime());

        when(examService.createExam(any(ExamDto.class))).thenReturn(response);

        mockMvc.perform(post("/exams")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(10))
            .andExpect(jsonPath("$.courseId").value(1))
            .andExpect(jsonPath("$.date").value("2025-08-01"));
    }

    @Test
    void testGetAllExams() throws Exception {
        ExamDto dto = new ExamDto(10L, 1L, LocalDate.of(2025, 8, 1), LocalTime.of(9, 0), LocalTime.of(12, 0));

        when(examService.getAllExams()).thenReturn(List.of(dto));

        mockMvc.perform(get("/exams"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(10))
            .andExpect(jsonPath("$[0].courseId").value(1));
    }

    @Test
    void testGetExamById() throws Exception {
        ExamDto dto = new ExamDto(10L, 1L, LocalDate.of(2025, 8, 1), LocalTime.of(9, 0), LocalTime.of(12, 0));

        when(examService.getExamById(10L)).thenReturn(dto);

        mockMvc.perform(get("/exams/10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(10))
            .andExpect(jsonPath("$.courseId").value(1));
    }

    @Test
    void testUpdateExam() throws Exception {
        ExamDto request = new ExamDto(null, 2L, LocalDate.of(2025, 9, 1), LocalTime.of(14, 0), LocalTime.of(16, 0));
        ExamDto response = new ExamDto(10L, 2L, request.date(), request.startTime(), request.endTime());

        when(examService.updateExam(eq(10L), any(ExamDto.class))).thenReturn(response);

        mockMvc.perform(put("/exams/10")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(10))
            .andExpect(jsonPath("$.courseId").value(2))
            .andExpect(jsonPath("$.date").value("2025-09-01"));
    }

    @Test
    void testDeleteExam() throws Exception {
        mockMvc.perform(delete("/exams/10"))
            .andExpect(status().isOk());
    }

    // -------------------
    // Exam Availability
    // -------------------

    @Test
    void testUpdateAvailability() throws Exception {
        List<ExamAvailabilityDto> dtos = List.of(
            new ExamAvailabilityDto(null, 1L, LocalDate.of(2025, 8, 10), LocalTime.of(9, 0), LocalTime.of(12, 0)),
            new ExamAvailabilityDto(null, 1L, LocalDate.of(2025, 8, 12), LocalTime.of(10, 0), LocalTime.of(13, 0))
        );

        mockMvc.perform(post("/exams/1/availability")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtos)))
            .andExpect(status().isOk());
    }

    @Test
    void testGetAvailability() throws Exception {
        ExamAvailabilityDto dto = new ExamAvailabilityDto(1L, 1L, LocalDate.of(2025, 8, 10), LocalTime.of(9, 0), LocalTime.of(12, 0));
        when(examService.getAvailabilityByStudentId(1L)).thenReturn(List.of(dto));

        mockMvc.perform(get("/exams/1/availability"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].studentId").value(1))
            .andExpect(jsonPath("$[0].date").value("2025-08-10"));
    }

    @Test
    void testDeleteAvailabilityByStudentId() throws Exception {
        Long studentId = 1L;

        mockMvc.perform(delete("/exams/{studentId}/availability", studentId))
               .andExpect(status().isOk());

        Mockito.verify(examService, times(1)).deleteAvailabilityByStudentId(studentId);
    }

    // -------------------
    // Exam Assignments
    // -------------------

    @Test
    void testAssignStudentToExam() throws Exception {
        LocalDate date = LocalDate.of(2025, 12, 15);
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(12, 0);
        ExamAssignmentDto dto = new ExamAssignmentDto(1L, 10L, 1L, ExamTask.Marking, date, startTime, endTime);
        when(examService.assignStudentToExam(eq(10L), any(ExamAssignmentDto.class))).thenReturn(dto);

        ExamAssignmentDto request = new ExamAssignmentDto(
            null,
            10L,
            1L,
            ExamTask.Marking,
            date,
            startTime,
            endTime
        );

        mockMvc.perform(post("/exams/10/assignments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.examId").value(10))
            .andExpect(jsonPath("$.studentId").value(1))
            .andExpect(jsonPath("$.task").value("Marking"))
            .andExpect(jsonPath("$.date").value(date.toString()))
            .andExpect(jsonPath("$.startTime").value("09:00:00"))
            .andExpect(jsonPath("$.endTime").value("12:00:00"));
    }


    @Test
    void testGetAssignments() throws Exception {
        LocalDate date = LocalDate.of(2025, 12, 15);
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(12, 0);

        ExamAssignmentDto dto = new ExamAssignmentDto(1L, 10L, 1L, ExamTask.Marking, date, startTime, endTime);
        when(examService.getAssignmentsByStudentId(1L)).thenReturn(List.of(dto));

        mockMvc.perform(get("/exams/assignments/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].examId").value(10))
            .andExpect(jsonPath("$[0].task").value("Marking"))
            .andExpect(jsonPath("$[0].date").value(date.toString()))
            .andExpect(jsonPath("$[0].startTime").value(startTime.format(DateTimeFormatter.ofPattern("HH:mm:ss"))))
            .andExpect(jsonPath("$[0].endTime").value(endTime.format(DateTimeFormatter.ofPattern("HH:mm:ss"))));

    }
}
