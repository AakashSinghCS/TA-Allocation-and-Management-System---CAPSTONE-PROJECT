package com.infinity.courseservice.enrollment;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.courseservice.controllers.EnrollmentController;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.ActiveEnrollmentDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.CompletedCourseDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.EnrollmentRequest;
import com.infinity.courseservice.dtos.EnrollmentDtos.StudentEnrollmentOverviewDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoNoCourse;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.enums.EnrollmentStatus;
import com.infinity.courseservice.enums.UserRole;
import com.infinity.courseservice.services.EnrollmentService;

@WebMvcTest(EnrollmentController.class)
@AutoConfigureMockMvc(addFilters = false)
public class EnrollmentControllerTest {

    @MockitoBean
    private EnrollmentService enrollmentService;

    @InjectMocks
    private EnrollmentController enrollmentController;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testEnrollStudent_returnsSuccessMessage() throws Exception {
        EnrollmentRequest request = new EnrollmentRequest(1L, 2L, 3L, EnrollmentStatus.ENROLLED, 90, 88);

        when(enrollmentService.enrollStudent(any())).thenReturn("Student enrolled");

        mockMvc.perform(post("/enrollments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Student enrolled"));
    }

    @Test
    void testDeleteEnrollment_returnsSuccessMessage() throws Exception {
        mockMvc.perform(delete("/enrollments/10"))
                .andExpect(status().isOk())
                .andExpect(content().string("Enrollment deleted"));
    }

    @Test
    void testGetCompletedCourses_returnsList() throws Exception {
        CompletedCourseDto dto = new CompletedCourseDto(new CourseDto(1L, "COSC", "Intro", "111"), 95, 85);
        when(enrollmentService.getCompletedCourses(1L)).thenReturn(List.of(dto));

        mockMvc.perform(get("/enrollments/completed/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].course.name").value("Intro"));
    }

    @Test
    void testGetActiveEnrollments_returnsList() throws Exception {
        ActiveEnrollmentDto dto = new ActiveEnrollmentDto(
                new CourseDto(1L, "COSC", "Intro", "111"),
                new SectionDtoNoCourse(1L, 2024, "W1", "001", null, 1),
                85);

        when(enrollmentService.getActiveEnrollmentList(1L)).thenReturn(List.of(dto));

        mockMvc.perform(get("/enrollments/active/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].course.courseNum").value("111"));
    }

    @Test
    void testGetEnrollmentOverview_returnsAggregatedData() throws Exception {
        StudentEnrollmentOverviewDto overview = new StudentEnrollmentOverviewDto(
                new UserDto(2L,"Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT), 12345678, "COSC", 2025, 3, null,
    null, null,true),
                List.of(new ActiveEnrollmentDto(
                        new CourseDto(1L, "COSC", "Intro", "111"),
                        new SectionDtoNoCourse(1L, 2024, "W1", "001", null, 1),
                        85)),
                List.of(new CompletedCourseDto(
                        new CourseDto(2L, "MATH", "Calc", "101"),
                        90,
                        88)));

        when(enrollmentService.getFullEnrollmentOverview(1L)).thenReturn(overview);

        mockMvc.perform(get("/enrollments/overview/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.student.firstName").value("Alice"))
                .andExpect(jsonPath("$.currentCourses[0].course.name").value("Intro"))
                .andExpect(jsonPath("$.completedCourses[0].course.name").value("Calc"));
    }
}
