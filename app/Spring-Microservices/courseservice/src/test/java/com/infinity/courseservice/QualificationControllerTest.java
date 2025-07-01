package com.infinity.courseservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.courseservice.controllers.QualificationController;
import com.infinity.courseservice.dtos.*;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.models.Qualification;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.services.QualificationService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(QualificationController.class)
@AutoConfigureMockMvc(addFilters = false)
class QualificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
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
        QualificationRequest request = new QualificationRequest(1L, null, null, "desc", "COSC");

        when(qualificationService.instructorDeleteQualification(any())).thenReturn("Deleted");

        mockMvc.perform(delete("/qualifications/instructor/deleteQualification")
               .contentType(MediaType.APPLICATION_JSON)
               .content(objectMapper.writeValueAsString(request)))
               .andExpect(status().isOk())
               .andExpect(content().string("Deleted"));
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
    void findByStudentId_shouldReturnStudentQualifications() throws Exception {
        StudentQualificationResponseDto dto = new StudentQualificationResponseDto(
                1L,
                new CourseDto(1L, "COSC", "Intro", "101"),
                "desc",
                null
        );

        when(qualificationService.findQualificationsByStudentId(3L)).thenReturn(List.of(dto));

        mockMvc.perform(get("/qualifications/findByStudentId/3"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$[0].description").value("desc"));
    }

    @Test
    void getQualificationsByInstructorId_shouldReturnList() throws Exception {
        Section mockSection = new Section();
        Qualification mockQualification = new Qualification();
        QualificationWithSectionDto dto = new QualificationWithSectionDto(mockSection, mockQualification);
        when(qualificationService.findQualificationsByInstructorId(4L)).thenReturn(List.of(dto));

        mockMvc.perform(get("/qualifications/instructor/4"))
               .andExpect(status().isOk());
    }
}
