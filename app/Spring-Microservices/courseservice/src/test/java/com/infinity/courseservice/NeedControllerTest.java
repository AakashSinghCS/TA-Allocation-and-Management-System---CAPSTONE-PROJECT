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
        NeedRequest request = new NeedRequest("Marking Labs", 30, 10, 2025, "Fall");
        NeedDto response = new NeedDto(5L, "Marking Labs", 30, 10);

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
        Long needId = 5L;
        NeedDto dto = new NeedDto(5L, "Marking Labs", 30, 10);

        when(needService.getNeed(needId)).thenReturn(dto);

        mockMvc.perform(MockMvcRequestBuilders.get("/needs/get/{needId}", needId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5L))
                .andExpect(jsonPath("$.description").value("Marking Labs"));
    }

    @Test
    void testGetAllNeedsByCourseId() throws Exception {
        Long courseId = 1L;
        List<NeedDto> mockList = List.of(
                new NeedDto(1L, "Labs", 20, 5),
                new NeedDto(2L, "Exams", 40, 10));

        when(needService.getAllNeedsByCourseId(courseId)).thenReturn(mockList);

        mockMvc.perform(MockMvcRequestBuilders.get("/needs/getAllNeeds/{courseId}", courseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].description").value("Labs"))
                .andExpect(jsonPath("$[1].description").value("Exams"));
    }

    @Test
    void testUpdateNeed() throws Exception {
        Long needId = 5L;
        NeedRequest request = new NeedRequest("Updated", 35, 15, 2025, "Fall");
        NeedDto updated = new NeedDto(5L, "Updated", 35, 15);

        when(needService.updateNeed(eq(request), eq(needId))).thenReturn(updated);

        mockMvc.perform(MockMvcRequestBuilders.put("/needs/update/{needId}", needId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated"))
                .andExpect(jsonPath("$.requiredGradingHours").value(35))
                .andExpect(jsonPath("$.numHoursCurrentlyAllocated").value(15));
    }

    @Test
    void testDeleteNeed() throws Exception {
        Long needId = 5L;

        when(needService.deleteNeed(needId)).thenReturn("Need deleted");

        mockMvc.perform(MockMvcRequestBuilders.delete("/needs/delete/{needId}", needId))
                .andExpect(status().isOk())
                .andExpect(content().string("Need deleted"));
    }
}
