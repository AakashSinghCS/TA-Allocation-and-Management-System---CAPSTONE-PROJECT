package com.infinity.userservice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

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
import com.infinity.userservice.exceptions.AuthorizationException;
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
        UserDto mockResponse = new UserDto(1L, "John", "Smith", UserRole.STUDENT);

        when(userService.getUserById(any())).thenReturn(mockResponse);

        mockMvc.perform(get("/users/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }
    
    @Test
    void testDeleteById_notSameIdNotAdmin_Forbidden() throws Exception {
        
        when(userService.deleteUserById(eq(1L), eq(2L), eq(List.of(
                "ROLE_STUDENT"))))
                .thenThrow(new AuthorizationException("You don't have permission for this action"));
        
        mockMvc.perform(delete("/users/delete/1")
                .header("X-User-Id", 2L)
                .header("X-User-Roles", "ROLE_STUDENT"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testDeleteById_SameIdNotAdmin_Success() throws Exception {

        when(userService.deleteUserById(eq(1L), eq(1L), eq(List.of("ROLE_STUDENT"))))
                .thenReturn("User deleted");

        mockMvc.perform(delete("/users/delete/1")
                .header("X-User-Id", 1L)
                .header("X-User-Roles", "ROLE_STUDENT"))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteById_NotSameIdAdmin_Success() throws Exception {

        when(userService.deleteUserById(eq(1L), eq(2L), eq(List.of(
                "ROLE_COORDINATOR"))))
                .thenReturn("User deleted");

        mockMvc.perform(delete("/users/delete/1")
                .header("X-User-Id", 2L)
                .header("X-User-Roles", "ROLE_COORDINATOR"))
                .andExpect(status().isOk());
    }
    
}
