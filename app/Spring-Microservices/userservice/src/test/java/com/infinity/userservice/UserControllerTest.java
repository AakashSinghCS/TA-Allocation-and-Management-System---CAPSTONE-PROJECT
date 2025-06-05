package com.infinity.userservice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.userservice.controllers.UserController;
import com.infinity.userservice.dtos.RegisterRequest;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.UserRole;
import com.infinity.userservice.services.UserService;

@WebMvcTest(UserController.class)
public class UserControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;
    
    @Test
    void testAddUser() throws Exception {
        RegisterRequest request = new RegisterRequest("john@example.com", "John", "Doe", "STUDENT", 42);
        UserDto mockResponse = new UserDto(Long.valueOf(1), "John", "Doe", UserRole.STUDENT);

        when(userService.register(any())).thenReturn(mockResponse);

        mockMvc.perform(post("/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.firstName").value("John"))
            .andExpect(jsonPath("$.role").value("STUDENT"));
    }
    
}
