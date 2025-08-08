package com.infinity.courseservice.exams;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
        Long userIdFromHeader = 1L;
        ExamDto request = new ExamDto(null, 1L, 1L, "W1 2025", LocalDate.of(2025, 8, 1), LocalTime.of(9, 0), LocalTime.of(12, 0));
        ExamDto response = new ExamDto(10L, 1L, 1L, "W1 2025", request.date(), request.startTime(), request.endTime());

        when(examService.createExam(any(ExamDto.class), eq(userIdFromHeader))).thenReturn(response);

        mockMvc.perform(post("/exams")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("X-User-Id",userIdFromHeader))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(10))
            .andExpect(jsonPath("$.courseId").value(1))
            .andExpect(jsonPath("$.date").value("2025-08-01"));
    }

    @Test
    void testGetAllExams() throws Exception {
        ExamDto dto = new ExamDto(10L, 1L, 1L, "W1 2025", LocalDate.of(2025, 8, 1), LocalTime.of(9, 0), LocalTime.of(12, 0));

        when(examService.getAllExams()).thenReturn(List.of(dto));

        mockMvc.perform(get("/exams"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(10))
            .andExpect(jsonPath("$[0].courseId").value(1));
    }

    @Test
    void testGetExamById() throws Exception {
        ExamDto dto = new ExamDto(10L, 1L, 1L, "W1 2025", LocalDate.of(2025, 8, 1), LocalTime.of(9, 0), LocalTime.of(12, 0));

        when(examService.getExamById(10L)).thenReturn(dto);

        mockMvc.perform(get("/exams/10"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(10))
            .andExpect(jsonPath("$.courseId").value(1));
    }

    @Test
    void testUpdateExam() throws Exception {
        Long userIdFromHeader = 1L;
        ExamDto request = new ExamDto(null, 1L, 2L, "W2 2025", LocalDate.of(2025, 9, 1), LocalTime.of(14, 0), LocalTime.of(16, 0));
        ExamDto response = new ExamDto(10L, 1L, 2L, "W2 2025", request.date(), request.startTime(), request.endTime());

        when(examService.updateExam(eq(10L), any(ExamDto.class), eq(userIdFromHeader))).thenReturn(response);

        mockMvc.perform(put("/exams/10")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("X-User-Id",userIdFromHeader))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(10))
            .andExpect(jsonPath("$.courseId").value(1))
            .andExpect(jsonPath("$.date").value("2025-09-01"));
    }

    @Test
    void testDeleteExam() throws Exception {
        Long userIdFromHeader = 1L;
        mockMvc.perform(delete("/exams/10")
            .header("X-User-Id",userIdFromHeader))
            .andExpect(status().isOk());
    }

    // -------------------
    // Exam Availability
    // -------------------

    @Test
    void testUpdateAvailability() throws Exception {
        Long userIdFromHeader = 1L;
        List<ExamAvailabilityDto> dtos = List.of(
            new ExamAvailabilityDto(null, 1L, LocalDate.of(2025, 8, 10), LocalTime.of(9, 0), LocalTime.of(12, 0)),
            new ExamAvailabilityDto(null, 1L, LocalDate.of(2025, 8, 12), LocalTime.of(10, 0), LocalTime.of(13, 0))
        );

        mockMvc.perform(post("/exams/1/availability")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dtos))
                .header("X-User-Id",userIdFromHeader))
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
        Long userIdFromHeader = 1L;
        mockMvc.perform(delete("/exams/{studentId}/availability", studentId)
                .header("X-User-Id",userIdFromHeader))
               .andExpect(status().isOk());

        Mockito.verify(examService, times(1)).deleteAvailabilityByStudentId(studentId,userIdFromHeader);
    }

    // -------------------
    // Exam Assignments
    // -------------------

    @Test
    void testAssignStudentToExam() throws Exception {
        Long userIdFromHeader = 1L;
        LocalDate date = LocalDate.of(2025, 12, 15);
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(12, 0);
        ExamAssignmentDto dto = new ExamAssignmentDto(1L, 10L, 1L, ExamTask.MARKING, date, startTime, endTime);
        when(examService.assignStudentToExam(eq(10L), any(ExamAssignmentDto.class), eq(userIdFromHeader))).thenReturn(dto);

        ExamAssignmentDto request = new ExamAssignmentDto(
            null,
            10L,
            1L,
            ExamTask.MARKING,
            date,
            startTime,
            endTime
        );

        mockMvc.perform(post("/exams/10/assignments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .header("X-User-Id",userIdFromHeader))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.examId").value(10))
            .andExpect(jsonPath("$.studentId").value(1))
            .andExpect(jsonPath("$.task").value("MARKING"))
            .andExpect(jsonPath("$.date").value(date.toString()))
            .andExpect(jsonPath("$.startTime").value("09:00:00"))
            .andExpect(jsonPath("$.endTime").value("12:00:00"));
    }


    @Test
    void testGetAssignments() throws Exception {
        LocalDate date = LocalDate.of(2025, 12, 15);
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(12, 0);

        ExamAssignmentDto dto = new ExamAssignmentDto(1L, 10L, 1L, ExamTask.MARKING, date, startTime, endTime);
        when(examService.getAssignmentsByStudentId(1L)).thenReturn(List.of(dto));

        mockMvc.perform(get("/exams/assignments/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].examId").value(10))
            .andExpect(jsonPath("$[0].task").value("MARKING"))
            .andExpect(jsonPath("$[0].date").value(date.toString()))
            .andExpect(jsonPath("$[0].startTime").value(startTime.format(DateTimeFormatter.ofPattern("HH:mm:ss"))))
            .andExpect(jsonPath("$[0].endTime").value(endTime.format(DateTimeFormatter.ofPattern("HH:mm:ss"))));

    }

    @Test
    void testGetAssignmentsForExam() throws Exception {
        Long examId = 1L;
        ExamAssignmentDto dto = new ExamAssignmentDto(
            10L, examId, 42L, ExamTask.MARKING,
            LocalDate.of(2025, 5, 1),
            LocalTime.of(10, 0),
            LocalTime.of(12, 0)
        );

        when(examService.getAssignmentsForExam(examId)).thenReturn(List.of(dto));

        mockMvc.perform(get("/exams/assignments/byexam/{examId}", examId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].studentId").value(42L));
    
    }

    @Test
    void testUnassignStudentFromExam() throws Exception {
        Long assignmentId = 10L;
        Long userIdFromHeader = 1L;
        mockMvc.perform(delete("/exams/assignments/{assignmentId}", assignmentId)
            .header("X-User-Id",userIdFromHeader))
            .andExpect(status().isOk());

        verify(examService).unassignStudentFromExam(assignmentId,userIdFromHeader);
    }

    @Test
    void testUpdateAssignmentByStudentId() throws Exception {
        Long examId = 1L;
        Long studentId = 2L;
        Long userIdFromHeader = 1L;
        ExamAssignmentDto inputDto = new ExamAssignmentDto(
            5L, examId, studentId, ExamTask.MARKING, LocalDate.of(2025, 8, 10),
            LocalTime.of(13, 0),
            LocalTime.of(15, 0)
        );

        when(examService.updateAssignmentByStudentId(eq(examId), eq(studentId), any(ExamAssignmentDto.class), eq(userIdFromHeader)))
            .thenReturn(inputDto);

        mockMvc.perform(put("/exams/assignments/{examId}/student/{studentId}", examId, studentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(inputDto))
                .header("X-User-Id",userIdFromHeader))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.examId").value(1))
            .andExpect(jsonPath("$.studentId").value(2))
            .andExpect(jsonPath("$.task").value("MARKING"))
            .andExpect(jsonPath("$.startTime").value("13:00:00"))
            .andExpect(jsonPath("$.endTime").value("15:00:00"));
    }

    private static String asJsonString(final Object obj) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            return mapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


}
