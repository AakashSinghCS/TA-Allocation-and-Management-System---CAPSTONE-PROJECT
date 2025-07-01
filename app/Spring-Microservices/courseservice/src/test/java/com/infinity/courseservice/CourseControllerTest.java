package com.infinity.courseservice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
import com.infinity.courseservice.dtos.AllocationDtos.AllocationDto;
import com.infinity.courseservice.dtos.AllocationDtos.AllocationHistoryDto;
import com.infinity.courseservice.dtos.AllocationDtos.OfferDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseNeedAndAllocations;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoNoCourse;
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
                CourseDto courseDto = new CourseDto(1L, "COSC", "Distributed Systems", "455");
                when(courseService.findCourse(1L)).thenReturn(courseDto);

                mockMvc.perform(get("/courses/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.deptCode").value("COSC"))
                                .andExpect(jsonPath("$.name").value("Distributed Systems"))
                                .andExpect(jsonPath("$.courseNum").value(455));
        }

    @Test
    void testAddCourse() throws Exception {
            CourseRequest request = new CourseRequest("COSC", "Distributed Systems", "455", null, null, null, null,
                            null, null,
                            null,null);
            CourseDto response = new CourseDto(1L, "COSC", "Distributed Systems", "455");

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
    void testUpdateCourse() throws Exception {
            CourseRequest request = new CourseRequest("COSC", "Distributed Systems", "455", null, null, null, null,
                            null, null,
                            null,null);
            CourseDto response = new CourseDto(1L, "COSC", "Distributed Systems", "455");

            when(courseService.updateCourse(any(CourseRequest.class), any())).thenReturn(response);

            mockMvc.perform(put("/courses/updateCourse/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                            .andExpect(status().isOk())
                            .andExpect(jsonPath("$.deptCode").value("COSC"))
                            .andExpect(jsonPath("$.name").value("Distributed Systems"))
                            .andExpect(jsonPath("$.courseNum").value(455));
    }

    @Test
    void testDeleteCourse() throws Exception {

            String response = "Course deleted";

            when(courseService.deleteCourse(any())).thenReturn(response);

            mockMvc.perform(delete("/courses/deleteCourse/1")
                            .contentType(MediaType.APPLICATION_JSON))
                            .andExpect(status().isOk());
    }

    @Test
    void testFilterCourses() throws Exception {
        CourseFilterRequest filterRequest = new CourseFilterRequest("COSC", "systems", null, null, 2024, "W1", null, null,
                LocalTime.of(14, 00), null);
        CourseSectionScheduleDto dto = new CourseSectionScheduleDto(1L,1L,"COSC", "Distributed Systems", "455", "001",
                2024, "W1", SectionType.LABORATORY, "Wed", LocalTime.of(14, 00), LocalTime.of(15, 30), false);

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
                CourseDto dto1 = new CourseDto(1L, "COSC", "Distributed Systems", "455");
                CourseDto dto2 = new CourseDto(1L, "COSC", "Operating Systems", "315");

                when(courseService.findCoursesByIds(List.of(1L, 2L))).thenReturn(List.of(dto1, dto2));

                mockMvc.perform(get("/courses/allById?ids=1&ids=2"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].name").value("Distributed Systems"))
                                .andExpect(jsonPath("$[1].name").value("Operating Systems"));
        }

        @Test
        void testGetCourseNeedAndAllocations() throws Exception {
                Long courseId = 1L;
                Integer year = 2025;
                String semester = "W1";

    NeedDto need = new NeedDto(10L, courseId, "Marking", 30, 10, year, semester);
    CourseDto course = new CourseDto(courseId, "COSC", "Security", "430");
        SectionDto sectionDto = new SectionDto(1L, 2025, "W1", "001", SectionType.LABORATORY, course);
    AllocationDto alloc = new AllocationDto(1L,
    new StudentDto(2L, "Alice", "Wang", 2345, "EECE", 2021, 3),
                    true, 10,
        new SectionDto(5L, 2025, "W1", "001", SectionType.LABORATORY, course)
    );

                CourseNeedAndAllocations response = new CourseNeedAndAllocations(sectionDto, need, List.of(alloc));
                when(courseService.getCourseNeedAndAllocations(courseId, year, semester)).thenReturn(response);

                mockMvc.perform(get("/courses/needAndAllocations/{courseId}/{year}/{semester}", courseId, year,
                                semester))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.section.semester").value("W1"))
                                .andExpect(jsonPath("$.section.course.name").value("Security"))
                                .andExpect(jsonPath("$.need.description").value("Marking"))
                                .andExpect(jsonPath("$.allocations[0].numberOfHours").value(10));
        }

        @Test
        void testGetInstructorCourseNeedsAndAllocations() throws Exception {
                Long instructorId = 77L;

                CourseDto course = new CourseDto(1L, "COSC", "Networks", "329");
                NeedDto need = new NeedDto(20L, 1L, "Grading", 25, 12, 2024, "W2");
                SectionDto sectionDto = new SectionDto(1L, 2025, "W1", "001", SectionType.LABORATORY, course);
                AllocationDto alloc = new AllocationDto(1L,
    new StudentDto(2L, "Alice", "Wang", 2345, "EECE", 2021, 3),
                    true, 10,
        new SectionDto(5L, 2025, "W1", "001", SectionType.LABORATORY, course)
    );

                CourseNeedAndAllocations entry = new CourseNeedAndAllocations(sectionDto, need, List.of(alloc));

                when(courseService.getInstructorCourseNeedsAndAllocations(instructorId)).thenReturn(List.of(entry));
                when(courseService.getInstructorCourseNeedsAndAllocations(instructorId)).thenReturn(List.of(entry));

                mockMvc.perform(get("/courses/needAndAllocations/{instructorId}", instructorId))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(1))
                                .andExpect(jsonPath("$[0].section.semester").value("W1"))
                                .andExpect(jsonPath("$[0].section.course.name").value("Networks"))
                                .andExpect(jsonPath("$[0].need.description").value("Grading"))
                                .andExpect(jsonPath("$[0].allocations[0].student.firstName").value("Alice"));
        }

        
        @Test
        void testGetAllDeptCodes() throws Exception {
                when(courseService.getAllDeptCodes()).thenReturn(List.of("COSC", "EECE"));

                mockMvc.perform(get("/courses/allDeptCodes"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0]").value("COSC"))
                                .andExpect(jsonPath("$[1]").value("EECE"));
        }

        @Test
        void testGetAllCourseNums() throws Exception {
                when(courseService.getAllCourseNums("COSC")).thenReturn(List.of("121", "310"));

                mockMvc.perform(get("/courses/allCourseNums").param("deptCode", "COSC"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0]").value("121"))
                                .andExpect(jsonPath("$[1]").value("310"));
        }

        @Test
        void testGetAllSections() throws Exception {
                when(courseService.getAllSections("COSC", "310")).thenReturn(List.of("001", "002"));

                mockMvc.perform(get("/courses/allSections")
                                .param("deptCode", "COSC")
                                .param("courseNum", "310"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0]").value("001"))
                                .andExpect(jsonPath("$[1]").value("002"));
        }

        @Test
        void testGetAllYears() throws Exception {
                when(courseService.getAllYears("COSC", "310", "001")).thenReturn(List.of("2023", "2024"));

                mockMvc.perform(get("/courses/allYears")
                                .param("deptCode", "COSC")
                                .param("courseNum", "310")
                                .param("section", "001"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0]").value("2023"))
                                .andExpect(jsonPath("$[1]").value("2024"));
        }

        @Test
        void testGetAllSemesters() throws Exception {
                when(courseService.getAllSemester("COSC", "310", "001", "2024")).thenReturn(List.of("W1", "W2"));

                mockMvc.perform(get("/courses/allSemesters")
                                .param("deptCode", "COSC")
                                .param("courseNum", "310")
                                .param("section", "001")
                                .param("year", "2024"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0]").value("W1"))
                                .andExpect(jsonPath("$[1]").value("W2"));
        }
}
