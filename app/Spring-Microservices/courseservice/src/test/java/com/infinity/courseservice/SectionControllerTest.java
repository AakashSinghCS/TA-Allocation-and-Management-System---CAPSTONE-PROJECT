package com.infinity.courseservice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalTime;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.courseservice.controllers.SectionController;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionScheduleDto;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.services.SectionService;

@WebMvcTest(SectionController.class)
@AutoConfigureMockMvc(addFilters = false)
public class SectionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SectionService sectionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testAddSection() throws Exception {
        Long courseId = 1L;
        CourseRequest request = new CourseRequest("COSC", "Security", "430", "001", SectionType.LECTURE, 2025, "W1", null, null, null);
        SectionDto response = new SectionDto(1L, 2025, "W1", "001", SectionType.LECTURE,
                new CourseDto("COSC", "Security", "430"));

        when(sectionService.addSection(eq(courseId), any(CourseRequest.class))).thenReturn(response);

        mockMvc.perform(post("/sections/addSection/{courseId}", courseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.year").value(2025))
                .andExpect(jsonPath("$.semester").value("W1"))
                .andExpect(jsonPath("$.section").value("001"))
                .andExpect(jsonPath("$.course.name").value("Security"));
    }

    @Test
    void testAddSectionSchedule() throws Exception {
        Long sectionId = 200L;
        CourseRequest request = new CourseRequest(null, null, null, null, null, null, null, "Mon", "09:00", "10:00");
        SectionScheduleDto response = new SectionScheduleDto("Mon", LocalTime.of(9, 0), LocalTime.of(10, 0), sectionId);

        when(sectionService.addSectionSchedule(eq(sectionId), any(CourseRequest.class))).thenReturn(response);

        mockMvc.perform(post("/sections/addSectionSchedule/{sectionId}", sectionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.day").value("Mon"))
                .andExpect(jsonPath("$.startTime").value("09:00:00"))
                .andExpect(jsonPath("$.sectionId").value(sectionId));
    }

    @Test
    void testGetSectionById() throws Exception {
        Long sectionId = 300L;
        SectionDto response = new SectionDto(sectionId, 2025, "W2", "002", SectionType.LECTURE,
                new CourseDto("COSC", "Networks", "329"));

        when(sectionService.getSectionById(sectionId)).thenReturn(response);

        mockMvc.perform(get("/sections/get/{id}", sectionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sectionId))
                .andExpect(jsonPath("$.year").value(2025))
                .andExpect(jsonPath("$.semester").value("W2"))
                .andExpect(jsonPath("$.section").value("002"))
                .andExpect(jsonPath("$.course.name").value("Networks"));
    }

}
