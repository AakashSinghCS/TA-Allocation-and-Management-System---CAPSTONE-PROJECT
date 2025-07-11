package com.infinity.userservice;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDateTime;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.userservice.controllers.InstructorController;
import com.infinity.userservice.dtos.Instructors.InstructorDto;
import com.infinity.userservice.services.InstructorService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(InstructorController.class)
@AutoConfigureMockMvc(addFilters = false)
public class InstructorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private InstructorService instructorService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetInstructorById() throws Exception {
        Long instructorId = 1L;
        LocalDateTime createdAt = LocalDateTime.of(2023, 1, 1, 10, 0);
        InstructorDto dto = new InstructorDto(instructorId, "Jane", "Doe", "jane@test.com", 1234, "Math", createdAt);

        when(instructorService.getInstructorById(instructorId)).thenReturn(dto);

        mockMvc.perform(get("/instructors/{instructorId}", instructorId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(instructorId))
                .andExpect(jsonPath("$.firstName").value("Jane"))
                .andExpect(jsonPath("$.employeeNum").value(1234))
                .andExpect(jsonPath("$.department").value("Math"));
    }
}
