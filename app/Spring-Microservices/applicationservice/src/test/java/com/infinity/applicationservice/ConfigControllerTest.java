package com.infinity.applicationservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.applicationservice.controllers.ConfigController;
import com.infinity.applicationservice.dtos.DeadlineDto;
import com.infinity.applicationservice.models.GlobalDeadline;
import com.infinity.applicationservice.services.ConfigService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ConfigController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ConfigControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @MockBean
    private ConfigService configService;

    private GlobalDeadline sampleDeadline;

    @BeforeEach
    void setup() {
        sampleDeadline = new GlobalDeadline();
        sampleDeadline.setId(1L);
        sampleDeadline.setName("student_application_deadline");
        sampleDeadline.setStartTime(LocalDateTime.parse("2025-08-01T00:00:00"));
        sampleDeadline.setEndTime(LocalDateTime.parse("2025-08-31T23:59:59"));
    }

    @Test
    void testGetAllDeadlines() throws Exception {
        when(configService.getDeadlines()).thenReturn(List.of(sampleDeadline));

        mvc.perform(get("/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("student_application_deadline"))
                .andExpect(jsonPath("$[0].startTime").value("2025-08-01T00:00:00"))
                .andExpect(jsonPath("$[0].endTime").value("2025-08-31T23:59:59"));
    }

    @Test
    void testGetDeadlineByName() throws Exception {
        when(configService.getDeadlineByName("student_application_deadline")).thenReturn(sampleDeadline);

        mvc.perform(get("/config/{name}", "student_application_deadline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("student_application_deadline"))
                .andExpect(jsonPath("$.startTime").value("2025-08-01T00:00:00"))
                .andExpect(jsonPath("$.endTime").value("2025-08-31T23:59:59"));
    }

    @Test
    void testAddDeadlines() throws Exception {
        DeadlineDto dto = new DeadlineDto(
                "student_application_deadline",
                LocalDateTime.parse("2025-08-01T00:00:00"),
                LocalDateTime.parse("2025-08-31T23:59:59")
        );

        when(configService.addDeadlines(any())).thenReturn(List.of(sampleDeadline));

        String body = mapper.writeValueAsString(List.of(dto));

        mvc.perform(post("/config/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("student_application_deadline"));
    }

    @Test
    void testUpdateDeadline() throws Exception {
        DeadlineDto dto = new DeadlineDto(
                "student_application_deadline",
                LocalDateTime.parse("2025-09-01T00:00:00"),
                LocalDateTime.parse("2025-09-30T23:59:59")
        );

        when(configService.updateDeadline(eq("student_application_deadline"), any()))
                .thenReturn(sampleDeadline);

        String body = mapper.writeValueAsString(dto);

        mvc.perform(put("/config/update/{name}", "student_application_deadline")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("student_application_deadline"));
    }
}
