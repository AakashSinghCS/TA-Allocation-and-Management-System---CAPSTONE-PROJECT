package com.infinity.userservice;

import java.time.LocalDateTime;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.infinity.userservice.controllers.InstructorController;
import com.infinity.userservice.dtos.InstructorDto;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.services.InstructorService;



@WebMvcTest(InstructorController.class)
@AutoConfigureMockMvc(addFilters = false)
public class InstructorControllerTest {
    
    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private InstructorService instructorService;

  
    @Test
    void testGetInstructorById_NotFound() throws Exception {

        when(instructorService.getInstructorById(any())).thenThrow(new NotFoundException("User with instructor id 2 not found"));

        mockMvc.perform(get("/instructors/2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetInstructorById_Success() throws Exception {
        LocalDateTime fixedTime = LocalDateTime.of(2023, 1, 1, 12, 0);
        Long instructorId = 1L;
        InstructorDto mockResponse = new InstructorDto(
            instructorId,
            "John",
            "Smith",
            "test@test.com",
            12345678,
            "Computer Science",
            fixedTime
        );

        when(instructorService.getInstructorById(any())).thenReturn(mockResponse);
        
        mockMvc.perform(get("/instructors/"+instructorId)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"));
    }
}
