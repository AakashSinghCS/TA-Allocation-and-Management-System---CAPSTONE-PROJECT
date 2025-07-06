package com.infinity.applicationservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.applicationservice.controllers.ConfigController;
import com.infinity.applicationservice.dtos.DeadlineDto;
import com.infinity.applicationservice.models.GlobalDeadline;
import com.infinity.applicationservice.repositories.ConfigRepository;
import com.infinity.applicationservice.services.ConfigService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.assertThat;


@WebMvcTest(ConfigController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ConfigControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @MockBean
    private ConfigService configService;

    private DeadlineDto sampleDto;

    @BeforeEach
    void setup() {
        sampleDto = new DeadlineDto(
                "student_application_deadline",
                LocalDateTime.parse("2025-08-01T00:00:00"),
                LocalDateTime.parse("2025-08-31T23:59:59")
        );
    }

    @Test
    void testGetAllDeadlines() throws Exception {
        when(configService.getDeadlines()).thenReturn(List.of(sampleDto));

        mvc.perform(get("/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("student_application_deadline"))
                .andExpect(jsonPath("$[0].startTime").value("2025-08-01T00:00:00"))
                .andExpect(jsonPath("$[0].endTime").value("2025-08-31T23:59:59"));
    }

    @Test
    void testGetDeadlineByName() throws Exception {
        when(configService.getDeadlineByName("student_application_deadline")).thenReturn(sampleDto);

        mvc.perform(get("/config/{name}", "student_application_deadline"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("student_application_deadline"))
                .andExpect(jsonPath("$.startTime").value("2025-08-01T00:00:00"))
                .andExpect(jsonPath("$.endTime").value("2025-08-31T23:59:59"));
    }

    @Test
    @WithMockUser(roles = "COORDINATOR")
    void testAddDeadlines() throws Exception {
        DeadlineDto inputDto = new DeadlineDto(
                "student_application_deadline",
                LocalDateTime.parse("2025-08-01T00:00:00"),
                LocalDateTime.parse("2025-08-31T23:59:59")
        );

        when(configService.addDeadlines(any())).thenReturn(List.of(sampleDto));

        String body = mapper.writeValueAsString(List.of(inputDto));

        mvc.perform(post("/config/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("student_application_deadline"));
    }

    @Test
    @WithMockUser(roles = "COORDINATOR")
    void testUpdateDeadline() throws Exception {
        DeadlineDto inputDto = new DeadlineDto(
                "student_application_deadline",
                LocalDateTime.parse("2025-09-01T00:00:00"),
                LocalDateTime.parse("2025-09-30T23:59:59")
        );

        when(configService.updateDeadline(eq("student_application_deadline"), any()))
                .thenReturn(inputDto);

        String body = mapper.writeValueAsString(inputDto);

        mvc.perform(put("/config/update/{name}", "student_application_deadline")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("student_application_deadline"))
                .andExpect(jsonPath("$.startTime").value("2025-09-01T00:00:00"))
                .andExpect(jsonPath("$.endTime").value("2025-09-30T23:59:59"));
    }

    @Test
    @WithMockUser(roles = "COORDINATOR")
    void testDeleteDeadline_ShouldReturnDeletedDto() throws Exception {

    when(configService.deleteDeadline("student_application_deadline")).thenReturn(sampleDto);

    mvc.perform(delete("/config/delete/{name}", "student_application_deadline"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("student_application_deadline"))
            .andExpect(jsonPath("$.startTime").value("2025-08-01T00:00:00"))
            .andExpect(jsonPath("$.endTime").value("2025-08-31T23:59:59"));
}
}