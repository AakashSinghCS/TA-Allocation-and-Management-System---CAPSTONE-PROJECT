package com.infinity.courseservice;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.courseservice.controllers.NeedController;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedRequest;
import com.infinity.courseservice.services.NeedService;

@WebMvcTest(NeedController.class)
@AutoConfigureMockMvc(addFilters = false)
public class NeedControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NeedService needService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testAddNeed() throws Exception {
        Long courseId = 1L;
        NeedRequest request = new NeedRequest("Marking Labs", 30, 10, 2025, "W1", null);
        NeedDto response = new NeedDto(5L, 1L,"Marking Labs", 30, 10, 2025, "W1", null);

        when(needService.addNeed(eq(request), eq(courseId))).thenReturn(response);

        mockMvc.perform(MockMvcRequestBuilders.post("/needs/add/{courseId}", courseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5L))
                .andExpect(jsonPath("$.description").value("Marking Labs"))
                .andExpect(jsonPath("$.requiredGradingHours").value(30))
                .andExpect(jsonPath("$.numHoursCurrentlyAllocated").value(10));
    }

    @Test
    void testGetNeed() throws Exception {
        Long courseId = 1L;
        Integer year = 2025;
        String semester = "W1";
        NeedDto dto = new NeedDto(5L, 1L, "Marking Labs", 30, 10, 2025, "W1", null);

        when(needService.getNeed(courseId, 2025, "W1")).thenReturn(dto);

        mockMvc.perform(MockMvcRequestBuilders.get("/needs/get/{courseId}/{year}/{semester}", courseId, year, semester))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5L))
                .andExpect(jsonPath("$.description").value("Marking Labs"));
    }

    @Test
    void testUpdateNeed() throws Exception {
        Long courseId = 1L;
        Integer year = 2025;
        String semester = "W1";
        NeedRequest request = new NeedRequest("Updated", 30, 10, 2025, "W1", List.of(1L));
        NeedDto updated = new NeedDto(5L, 1L, "Updated", 30, 10, 2025, "W1",
                List.of(new CourseDto(1L, "COSC", "Security", "430")));

        when(needService.updateNeed(eq(request), eq(courseId), eq(2025), eq("W1"))).thenReturn(updated);

        mockMvc.perform(
                MockMvcRequestBuilders.put("/needs/update/{courseId}/{year}/{semester}", courseId, year, semester)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated"))
                .andExpect(jsonPath("$.requiredGradingHours").value(30))
                .andExpect(jsonPath("$.numHoursCurrentlyAllocated").value(10))
                .andExpect(jsonPath("$.prerequisites[0].deptCode").value("COSC"));
    }
    
    @Test
    void testUpdateNeedAllocatedHours() throws Exception {
        Long needId = 1L;
        int numHoursAllocated = 6;
        when(needService.updateAllocatedHours(needId, numHoursAllocated)).thenReturn("Need updated");
        mockMvc.perform(
                MockMvcRequestBuilders.put("/needs/updateAllocatedHours/{needId}", needId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .param("numAllocatedHours", Integer.toString(numHoursAllocated)))
                .andExpect(status().isOk())
                .andExpect(content().string("Need updated"));
    }

    @Test
    void testDeleteNeed() throws Exception {
        Long courseId = 1L;
        Integer year = 2025;
        String semester = "W1";

        when(needService.deleteNeed(courseId, 2025, "W1")).thenReturn("Need deleted");

        mockMvc.perform(MockMvcRequestBuilders.delete("/needs/delete/{courseId}/{year}/{semester}", courseId, year, semester))
                .andExpect(status().isOk())
                .andExpect(content().string("Need deleted"));
    }
}
