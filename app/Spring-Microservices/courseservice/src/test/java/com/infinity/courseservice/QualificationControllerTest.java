package com.infinity.courseservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.courseservice.controllers.QualificationController;
import com.infinity.courseservice.dtos.*;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.UserDtos.StudentDto;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.models.Qualification;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.StudentQualification;
import com.infinity.courseservice.services.QualificationService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(QualificationController.class)
@AutoConfigureMockMvc(addFilters = false)
class QualificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private QualificationService qualificationService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getQualification_shouldReturnQualificationDto() throws Exception {
        QualificationDto dto = new QualificationDto(
                new CourseDto(1L, "COSC", "Intro", "101"),
                "desc",
                null
        );

        when(qualificationService.findQualification(1L)).thenReturn(dto);

        mockMvc.perform(get("/qualifications/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.description").value("desc"));
    }

    @Test
    void getQualificationsByDeptCode_shouldReturnList() throws Exception {
        // CourseDto courseDto = new CourseDto(1L, "COSC", "Intro", "101");
        // StudentDto studentDto = new StudentDto(2L, "Alice","Sun",10001,"BA",  2020, 3);
        Qualification q = new Qualification();
        when(qualificationService.findQualificationsByDeptCode("COSC")).thenReturn(List.of(q));

        mockMvc.perform(get("/qualifications/byDepartment/COSC"))
               .andExpect(status().isOk());
    }

    @Test
    void instructorAddQualification_shouldReturnDto() throws Exception {
        QualificationRequest request = new QualificationRequest(1L, null ,null, "desc", "COSC");
        QualificationDto dto = new QualificationDto(
                new CourseDto(1L, "COSC", "Intro", "101"),
                "desc",
                null
        );

        when(qualificationService.instructorAddQualification(any())).thenReturn(dto);

        mockMvc.perform(post("/qualifications/instructor/addQualification")
               .contentType(MediaType.APPLICATION_JSON)
               .content(objectMapper.writeValueAsString(request)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.description").value("desc"));
    }

    @Test
    void instructorDeleteQualification_shouldReturnConfirmation() throws Exception {
        // Arrange
        String requestJson = """
                {
                  "description": "Test Description"
                }
                """;

        when(qualificationService.instructorDeleteQualification(any()))
                .thenReturn(List.of(10L, 20L));

        // Act + Assert
        mockMvc.perform(delete("/qualifications/instructor/deleteQualification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
               .andExpect(status().isOk())
               .andExpect(content().json("[10,20]"));
    }

    @Test
    void studentUpdateQualification_shouldReturnQualificationDtos() throws Exception {
        StudentQualiRequest request = new StudentQualiRequest(List.of(1L));
        QualificationDto dto = new QualificationDto(
                new CourseDto(1L, "COSC", "Intro", "101"),
                "desc",
                null
        );

        when(qualificationService.studentUpdateQualifications(any(), eq(2L)))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/qualifications/2/studentUpdateQualification")
               .contentType(MediaType.APPLICATION_JSON)
               .content(objectMapper.writeValueAsString(request)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].description").value("desc"));
    }

    @Test
    void findByStudentId_shouldReturnStudentQualificationIds() throws Exception {
        Long studentId = 42L;
        when(qualificationService.findQualificationsByStudentId(studentId))
                .thenReturn(List.of(100L, 200L, 300L));

        mockMvc.perform(get("/qualifications/findByStudentId/{studentId}", studentId)
                        .accept(MediaType.APPLICATION_JSON))
               .andExpect(status().isOk())
               .andExpect(content().json("[100,200,300]"));
    }

    @Test
    void getQualificationsByInstructorId_shouldReturnOk() throws Exception {
        Long instructorId = 5L;

        QualificationWithSectionDto dto = new QualificationWithSectionDto(
            10L,
            2024,
            "W1",
            "001",
            SectionType.LECTURE,
            100L,
            "COSC",
            "Test Qualification"
        );

        when(qualificationService.findQualificationsByInstructorId(instructorId))
                .thenReturn(List.of(dto));

        mockMvc.perform(get("/qualifications/instructor/{instructorId}", instructorId)
                .accept(MediaType.APPLICATION_JSON))
               .andExpect(status().isOk())
               .andExpect(content().json("""
                   [
                       {
                           "sectionId":10,
                           "year":2024,
                           "semester":"W1",
                           "sectionName":"001",
                           "sectionType":"LECTURE",
                           "qualificationId":100,
                           "courseDeptCode":"COSC",
                           "qualificationDescription":"Test Qualification"
                       }
                   ]
               """));
    }
}
