package com.infinity.courseservice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.courseservice.controllers.SectionController;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.SectionDtos.AssignInstructorRequest;
import com.infinity.courseservice.dtos.SectionDtos.SectionAddDtoRequest;
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
                CourseRequest request = new CourseRequest("COSC", "Security", "430", "001", SectionType.LECTURE, 2025,
                                "W1", null, null, null,null);
                SectionDto response = new SectionDto(1L, 2025, "W1", "001", SectionType.LECTURE,
                                new CourseDto(1L, "COSC", "Security", "430"));

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
                CourseRequest request = new CourseRequest(null, null, null, null, null, null, null, "Mon", "09:00",
                                "10:00",null);
                SectionScheduleDto response = new SectionScheduleDto("Mon", LocalTime.of(9, 0), LocalTime.of(10, 0),
                                sectionId, 2L);

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
                                new CourseDto(1L, "COSC", "Networks", "329"));

                when(sectionService.getSectionById(sectionId)).thenReturn(response);

                mockMvc.perform(get("/sections/get/{id}", sectionId))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(sectionId))
                                .andExpect(jsonPath("$.year").value(2025))
                                .andExpect(jsonPath("$.semester").value("W2"))
                                .andExpect(jsonPath("$.section").value("002"))
                                .andExpect(jsonPath("$.course.name").value("Networks"));
        }

        @Test
        void testUpdateSection() throws Exception {
                CourseRequest request = new CourseRequest("COSC", "Security", "430", "001", SectionType.LECTURE, 2025,
                                "W1", null, null, null,null);
                SectionDto response = new SectionDto(1L, 2025, "W1", "001", SectionType.LECTURE,
                                   new CourseDto(1L, "COSC", "Security", "430"));

                when(sectionService.updateSection(any(), any(CourseRequest.class))).thenReturn(response);

                mockMvc.perform(put("/sections/updateSection/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.year").value(2025))
                                .andExpect(jsonPath("$.semester").value("W1"))
                                .andExpect(jsonPath("$.section").value("001"))
                                .andExpect(jsonPath("$.type").value("LECTURE"));
        }

        @Test
        void testDeleteSection() throws Exception {

                String response = "Section deleted";

                when(sectionService.deleteSection(any())).thenReturn(response);

                mockMvc.perform(delete("/sections/deleteSection/1")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk());
        }

        @Test
        void testGetSectionSchedules() throws Exception {
                SectionScheduleDto schedule1 = new SectionScheduleDto("Tue", LocalTime.of(10, 0),
                                LocalTime.parse("11:00"), 1L, 3L);
                SectionScheduleDto schedule2 = new SectionScheduleDto("Fri", LocalTime.of(12, 0),
                                LocalTime.parse("13:30"), 2L, 4L);
                List<SectionScheduleDto> response = List.of(schedule1, schedule2);

                when(sectionService.getSectionSchedules(any())).thenReturn(response);

                mockMvc.perform(get("/sections/getSectionSchedules/1")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$[0].day").value("Tue"))
                                .andExpect(jsonPath("$[0].startTime").value("10:00:00"))
                                .andExpect(jsonPath("$[0].endTime").value("11:00:00"));
        }

        @Test
        void testUpdateSectionSchedule() throws Exception {
                CourseRequest request = new CourseRequest("COSC", "Security", "430", "001", SectionType.LECTURE, 2025,
                                "W1", null, null, null,null);
                SectionScheduleDto response = new SectionScheduleDto("Tue", LocalTime.parse("10:00"), 
                                LocalTime.parse("11:00"), 1L, 2L);

                when(sectionService.updateSectionSchedule(any(), any(CourseRequest.class))).thenReturn(response);

                mockMvc.perform(put("/sections/updateSectionSchedule/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.day").value("Tue"))
                                .andExpect(jsonPath("$.startTime").value("10:00:00"))
                                .andExpect(jsonPath("$.endTime").value("11:00:00"));
        }

        @Test
        void testDeleteSectionSchedule() throws Exception {

                String response = "Section schedule deleted";

                when(sectionService.deleteSection(any())).thenReturn(response);

                mockMvc.perform(delete("/sections/deleteSectionSchedule/1")
                                .contentType(MediaType.APPLICATION_JSON))
                                .andExpect(status().isOk());
        }

        @Test
        void testAssignInstructor() throws Exception {
                AssignInstructorRequest request = new AssignInstructorRequest(99L, 101L);
                when(sectionService.assignInstructor(eq(request))).thenReturn("Instructor assigned to section 101");

                mockMvc.perform(post("/sections/assignInstructor")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(content().string("Instructor assigned to section 101"));
        }

        @Test
        void testUnassignInstructor() throws Exception {
                Long sectionId = 101L;
                Long instructorId = 99L;

                when(sectionService.unassignInstructor(sectionId, instructorId))
                                .thenReturn("Instructor unassigned from 101");

                mockMvc.perform(delete("/sections/unassignInstructor/{sectionId}/{instructorId}", sectionId,
                                instructorId))
                                .andExpect(status().isOk())
                                .andExpect(content().string("Instructor unassigned from 101"));
        }

        @Test
        void testGetInstructorSections() throws Exception {
                Long instructorId = 99L;
                List<SectionDto> sections = List.of(
                                new SectionDto(10L, 2025, "W1", "001", SectionType.LECTURE,
                                                new CourseDto(1L, "COSC", "Security", "430")),
                                new SectionDto(11L, 2025, "W1", "002", SectionType.LABORATORY,
                                                new CourseDto(2L, "COSC", "AI", "310")));

                when(sectionService.getInstructorSections(instructorId)).thenReturn(sections);

                mockMvc.perform(get("/sections/getInstructorSections/{instructorId}", instructorId))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.length()").value(2))
                                .andExpect(jsonPath("$[0].course.name").value("Security"))
                                .andExpect(jsonPath("$[1].course.name").value("AI"));
        }

        @Test
    @WithMockUser(roles = "COORDINATOR")
    void addEndpoint_ReturnsTrue() throws Exception {
        // Arrange: mock service
        when(sectionService.add(any(SectionAddDtoRequest.class))).thenReturn(true);

        String json = """
            {
              "deptCode":"COSC",
              "name":"Intro to CS",
              "courseNum":"111",
              "section":"001",
              "type":"LECTURE",
              "year":2024,
              "semester":"W1",
              "instructorId":42,
              "sectionSchedules":[{"day":"Monday","startTime":"08:00","endTime":"09:30","sectionId":null}]
            }
        """;

        // Act & Assert: use full controller path
        mockMvc.perform(post("/sections/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(content().string("true"));
    }


}
