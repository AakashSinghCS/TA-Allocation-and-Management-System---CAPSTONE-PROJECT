package com.infinity.courseservice;

import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
import com.infinity.courseservice.dtos.AllocationDtos.AllocationHistoryDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseNeedsAndAllocations;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionScheduleDto;
import com.infinity.courseservice.dtos.UserDtos.StudentDto;
import com.infinity.courseservice.services.CourseService;
import com.infinity.courseservice.enums.*;

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
        List<NeedDto> needs = List.of(
                new NeedDto(1L, "Lab Work", 25, 10));
        List<AllocationHistoryDto> allocations = List.of(
                new AllocationHistoryDto(1L, new StudentDto(1L, "John", "Doe", null, null, null, null), null, true, 10,
                        null));

        CourseNeedsAndAllocations result = new CourseNeedsAndAllocations(courseDto, needs, allocations);

        when(courseService.getCourseNeedsAndAllocations(courseId)).thenReturn(result);

        mockMvc.perform(get("/courses/needsAndAllocations/{courseId}", courseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.course.name").value("Security"))
                .andExpect(jsonPath("$.needs[0].description").value("Lab Work"))
                .andExpect(jsonPath("$.allocations[0].student.firstName").value("John"));
    }

    @Test
    void testAddSection() throws Exception {
        Long courseId = 1L;
        CourseRequest request = new CourseRequest("COSC", "Security", "430", "001", SectionType.LECTURE, "2025W1", null, null, null);
        SectionDto response = new SectionDto(1L, "2025W1", "001", SectionType.LECTURE,
                new CourseDto("COSC", "Security", "430"));

        when(courseService.addSection(eq(courseId), any(CourseRequest.class))).thenReturn(response);

        mockMvc.perform(post("/courses/{courseId}/addSection", courseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.term").value("2025W1"))
                .andExpect(jsonPath("$.section").value("001"))
                .andExpect(jsonPath("$.course.name").value("Security"));
    }

    @Test
    void testAddSectionSchedule() throws Exception {
        Long courseId = 1L;
        Long sectionId = 200L;
        CourseRequest request = new CourseRequest(null, null, null, null, null, null, "Mon", "09:00", "10:00");
        SectionScheduleDto response = new SectionScheduleDto("Mon", LocalTime.of(9, 0), LocalTime.of(10, 0), sectionId);

        when(courseService.addSectionSchedule(eq(sectionId), any(CourseRequest.class))).thenReturn(response);

        mockMvc.perform(post("/courses/{courseId}/{sectionId}/addSectionSchedule", courseId, sectionId)
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
        SectionDto response = new SectionDto(sectionId, "2025W2", "002", SectionType.LECTURE,
                new CourseDto("COSC", "Networks", "329"));

        when(courseService.getSectionById(sectionId)).thenReturn(response);

        mockMvc.perform(get("/courses/sections/get/{id}", sectionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sectionId))
                .andExpect(jsonPath("$.term").value("2025W2"))
                .andExpect(jsonPath("$.section").value("002"))
                .andExpect(jsonPath("$.course.name").value("Networks"));
    }

}
