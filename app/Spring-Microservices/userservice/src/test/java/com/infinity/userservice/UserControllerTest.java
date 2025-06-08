package com.infinity.userservice;

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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.infinity.userservice.controllers.UserController;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.security.JwtUtil;
import com.infinity.userservice.services.UserService;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
public class UserControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @Test
    void testGetUserById_NotFound() throws Exception {

        when(userService.getUserById(any())).thenThrow(new NotFoundException("User with id 2 not found"));

        mockMvc.perform(get("/users/2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
    
    @Test
    void testGetUserById_Success() throws Exception {
        UserDto mockResponse = new UserDto(Long.valueOf(1), "John", "Smith", UserRole.STUDENT);

        when(userService.getUserById(any())).thenReturn(mockResponse);

        mockMvc.perform(get("/users/1")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.firstName").value("John"))
            .andExpect(jsonPath("$.role").value("STUDENT"));
    }
    
}
