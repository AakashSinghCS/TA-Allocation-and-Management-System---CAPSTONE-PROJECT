package com.infinity.userservice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.userservice.controllers.AuthController;
import com.infinity.userservice.dtos.LoginRequest;
import com.infinity.userservice.dtos.RegisterRequest;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.models.User;
import com.infinity.userservice.security.JwtUtil;
import com.infinity.userservice.services.UserService;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtUtil jwtUtil;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    //Registration

    @Test
    void whenEmailIsInvalid_thenReturns400() throws Exception {
        RegisterRequest request = new RegisterRequest("invalid-email", "John", "Smith", "P@ssword1", "STUDENT");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists());
    }
    
    @Test
    void whenFirstNameIsMissing_thenReturns400() throws Exception {
        RegisterRequest request = new RegisterRequest("john@test.com", "", "Smith", "P@ssword1", "STUDENT");
        
        mockMvc.perform(post("/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(new ObjectMapper().writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.firstName").exists());
    }
    
    @Test
    void whenLastNameIsMissing_thenReturns400() throws Exception {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "", "P@ssword1", "STUDENT");
        
        mockMvc.perform(post("/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(new ObjectMapper().writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.lastName").exists());
    }
    
    @Test
    void whenPasswordIsWeak_thenReturns400() throws Exception {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "123", "STUDENT");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    void whenUserTypeIsMissing_thenReturns400() throws Exception {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", "");

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.userType").exists());
    }

    @Test
    void succesfullyRegisterStudent_thenReturns201() throws Exception {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", "STUDENT");
        UserDto mockResponse = new UserDto(1L, "John", "Smith", UserRole.STUDENT);

        when(userService.register(any())).thenReturn(mockResponse);

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }

    @Test
    void whenEmailIsMissing_thenReturns201() throws Exception {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", "INSTRUCTOR");
        UserDto mockResponse = new UserDto(1L, "John", "Smith", UserRole.INSTRUCTOR);

        when(userService.register(any())).thenReturn(mockResponse);

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.role").value("INSTRUCTOR"));
    }

    @Test
    void succesfullyRegisterCoordinator_thenReturns201() throws Exception {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", "COORDINATOR");
        UserDto mockResponse = new UserDto(1L, "John", "Smith", UserRole.COORDINATOR);

        when(userService.register(any())).thenReturn(mockResponse);

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.role").value("COORDINATOR"));
    }

    //Login

    @Test
    void whenLoginIsMissingEmail_thenReturns400() throws Exception {
        LoginRequest request = new LoginRequest("", "P@ssword1");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists());
    }

    @Test
    void whenLoginIsMissingPassword_thenReturns400() throws Exception {
        LoginRequest request = new LoginRequest("john@test.com", "");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    void succesfullyLoginUser_thenReturns200() throws Exception {
        LoginRequest request = new LoginRequest("john@test.com", "P@ssword1");

        User mockUser = new Student();
        mockUser.setEmail(request.email());
        mockUser.setPassword("hashedPass");
        mockUser.setId(1L);
        mockUser.setUserType(UserRole.STUDENT);

        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.getPrincipal()).thenReturn(mockUser);

        when(authenticationManager.authenticate(any())).thenReturn(mockAuth);
        when(jwtUtil.generateToken(eq(request.email()), eq(1L), eq(List.of("ROLE_STUDENT"))))
                .thenReturn("mock-jwt-token");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"));
    }
}
