package com.infinity.courseservice;

import java.time.LocalTime;
import  java.util.List;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.courseservice.controllers.CourseController;
import com.infinity.courseservice.dtos.CourseDto;
import com.infinity.courseservice.dtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseSectionScheduleDto;
import com.infinity.courseservice.services.CourseService;

@WebMvcTest(CourseController.class)
@AutoConfigureMockMvc(addFilters = false)
public class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CourseService courseService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testFindCourse() throws Exception {
        CourseDto courseDto = new CourseDto("COSC", "Distributed Systems", 455);
        when(courseService.findCourse(1L)).thenReturn(courseDto);

        mockMvc.perform(get("/courses/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.deptCode").value("COSC"))
            .andExpect(jsonPath("$.name").value("Distributed Systems"))
            .andExpect(jsonPath("$.courseNum").value(455));
    }

    @Test
    void testAddCourse() throws Exception {
        CourseRequest request = new CourseRequest("COSC", "Distributed Systems", 455);
        CourseDto response = new CourseDto("COSC", "Distributed Systems", 455);

        when(courseService.addCourse(any(CourseRequest.class))).thenReturn(response);

        mockMvc.perform(post("/courses/add")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.deptCode").value("COSC"))
            .andExpect(jsonPath("$.name").value("Distributed Systems"))
            .andExpect(jsonPath("$.courseNum").value(455));
    }

    @Test
    void testFilterCourses() throws Exception {
        CourseFilterRequest filterRequest = new CourseFilterRequest("COSC", null, null, null, "2024W1", null, LocalTime.of(14, 00), null);
        CourseSectionScheduleDto dto = new CourseSectionScheduleDto("COSC", "Distributed Systems", 455, "001", "2024W1", "Wed", LocalTime.of(14, 00), LocalTime.of(15, 30));

        when(courseService.filterCourses(any(CourseFilterRequest.class)))
            .thenReturn(List.of(dto));

        mockMvc.perform(post("/courses/filterCourses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(filterRequest)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].deptCode").value("COSC"))
            .andExpect(jsonPath("$[0].courseNum").value(455));
    }

    @Test
    void testGetCoursesByIds() throws Exception {
        CourseDto dto1 = new CourseDto("COSC", "Distributed Systems", 455);
        CourseDto dto2 = new CourseDto("COSC", "Operating Systems", 315);

        when(courseService.findCoursesByIds(List.of(1L, 2L))).thenReturn(List.of(dto1, dto2));

        mockMvc.perform(get("/courses/allById?ids=1&ids=2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Distributed Systems"))
            .andExpect(jsonPath("$[1].name").value("Operating Systems"));
    }
}
