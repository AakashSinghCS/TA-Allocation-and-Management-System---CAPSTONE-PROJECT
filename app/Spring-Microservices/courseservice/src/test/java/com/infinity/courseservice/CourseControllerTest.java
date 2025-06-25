package com.infinity.courseservice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.courseservice.controllers.CourseController;
import com.infinity.courseservice.dtos.AllocationDtos.AllocationHistoryDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseNeedAndAllocations;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.UserDtos.StudentDto;
import com.infinity.courseservice.enums.SectionType;
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
        CourseDto courseDto = new CourseDto("COSC", "Distributed Systems", "455");
        when(courseService.findCourse(1L)).thenReturn(courseDto);

        mockMvc.perform(get("/courses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deptCode").value("COSC"))
                .andExpect(jsonPath("$.name").value("Distributed Systems"))
                .andExpect(jsonPath("$.courseNum").value(455));
    }

    @Test
    void testAddCourse() throws Exception {
        CourseRequest request = new CourseRequest("COSC", "Distributed Systems", "455", null, null, null, null, null,
                null);
        CourseDto response = new CourseDto("COSC", "Distributed Systems", "455");

        when(courseService.addCourse(any(CourseRequest.class))).thenReturn(response);

        mockMvc.perform(post("/courses/addCourse")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.deptCode").value("COSC"))
                .andExpect(jsonPath("$.name").value("Distributed Systems"))
                .andExpect(jsonPath("$.courseNum").value(455));
    }

    @Test
    void testFilterCourses() throws Exception {
        CourseFilterRequest filterRequest = new CourseFilterRequest("COSC", "systems", null, null, "2024W1", null, null,
                LocalTime.of(14, 00), null);
        CourseSectionScheduleDto dto = new CourseSectionScheduleDto("COSC", "Distributed Systems", "455", "001",
                "2024W1", SectionType.LAB, "Wed", LocalTime.of(14, 00), LocalTime.of(15, 30));

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
        CourseDto dto1 = new CourseDto("COSC", "Distributed Systems", "455");
        CourseDto dto2 = new CourseDto("COSC", "Operating Systems", "315");

        when(courseService.findCoursesByIds(List.of(1L, 2L))).thenReturn(List.of(dto1, dto2));

        mockMvc.perform(get("/courses/allById?ids=1&ids=2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Distributed Systems"))
                .andExpect(jsonPath("$[1].name").value("Operating Systems"));
    }

    @Test
    void testGetCourseNeedsAndAllocations() throws Exception {
        Long courseId = 1L;
        CourseDto courseDto = new CourseDto("COSC", "Security", "430");
        NeedDto need = new NeedDto(1L, 1L, "Lab Work", 25, 10, 2025, "W1");
        List<AllocationHistoryDto> allocations = List.of(
                new AllocationHistoryDto(1L, new StudentDto(1L, "John", "Doe", null, null, null, null), null, true, 10,
                        null));

        CourseNeedAndAllocations result = new CourseNeedAndAllocations(courseDto, need, allocations);

        when(courseService.getCourseNeedAndAllocations(courseId, 2025, "W1")).thenReturn(result);

        mockMvc.perform(get("/courses/needAndAllocations/{courseId}/{year}/{semester}", courseId, 2025, "W1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.course.name").value("Security"))
                .andExpect(jsonPath("$.need.description").value("Lab Work"))
                .andExpect(jsonPath("$.allocations[0].student.firstName").value("John"));
    }
}
