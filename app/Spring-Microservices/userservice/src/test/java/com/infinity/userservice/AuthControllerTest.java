package com.infinity.userservice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.userservice.controllers.AuthController;
import com.infinity.userservice.dtos.EmailRequest;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.Registration.LoginRequest;
import com.infinity.userservice.dtos.Registration.LoginResponse;
import com.infinity.userservice.dtos.Registration.RegisterRequest;
import com.infinity.userservice.dtos.Registration.ResetRequest;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.models.Role;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.models.User;
import com.infinity.userservice.services.AuthService;
import com.infinity.userservice.services.UserService;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private AuthService authService;

    //Registration

    @Test
    void whenEmailIsInvalid_thenReturns400() throws Exception {
        RegisterRequest request = new RegisterRequest("invalid-email", "John", "Smith", "P@ssword1", UserRole.STUDENT, false);

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").exists());
    }
    
    @Test
    void whenFirstNameIsMissing_thenReturns400() throws Exception {
        RegisterRequest request = new RegisterRequest("john@test.com", "", "Smith", "P@ssword1", UserRole.STUDENT, false);
        
        mockMvc.perform(post("/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(new ObjectMapper().writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.firstName").exists());
    }
    
    @Test
    void whenLastNameIsMissing_thenReturns400() throws Exception {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "", "P@ssword1", UserRole.STUDENT, false);
        
        mockMvc.perform(post("/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(new ObjectMapper().writeValueAsString(request)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.lastName").exists());
    }
    
    @Test
    void whenPasswordIsWeak_thenReturns400() throws Exception {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "123", UserRole.STUDENT, false);

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.password").exists());
    }

    @Test
    void whenUserTypeIsMissing_thenReturns400() throws Exception {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", null, false);

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.userType").exists());
    }

    @Test
    void succesfullyRegisterStudent_thenReturns201() throws Exception {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", UserRole.STUDENT, false);
        UserDto mockResponse = new UserDto(1L, "John", "Smith", "test@test.com", List.of(UserRole.STUDENT));

        when(userService.register(any())).thenReturn(mockResponse);

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.roles").isArray())
                .andExpect(jsonPath("$.roles[0]").value("STUDENT"));

    }

    @Test
    void successfullyRegisterInstructor_thenReturns201() throws Exception {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", UserRole.INSTRUCTOR, false);
        UserDto mockResponse = new UserDto(1L, "John", "Smith", "test@test.com", List.of(UserRole.INSTRUCTOR));

        when(userService.register(any())).thenReturn(mockResponse);

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.roles").isArray())
                .andExpect(jsonPath("$.roles[0]").value("INSTRUCTOR"));

    }

    @Test
    void succesfullyRegisterCoordinator_thenReturns201() throws Exception {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", 
                UserRole.COORDINATOR, false);
        UserDto mockResponse = new UserDto(1L, "John", "Smith", "test@test.com", List.of(UserRole.COORDINATOR));

        when(userService.register(any())).thenReturn(mockResponse);

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.roles").isArray())
                .andExpect(jsonPath("$.roles[0]").value("COORDINATOR"));

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
        Set<Role> roles = new HashSet<>(Set.of(new Role(1L, UserRole.STUDENT)));
        mockUser.setRoles(roles);

        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.getPrincipal()).thenReturn(mockUser);

        when(authService.login(eq(request)))
                .thenReturn(new LoginResponse("mock-jwt-token"));

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(new ObjectMapper().writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"));
    }

    @Test
    void testForgotPassword_success() throws Exception {
        EmailRequest request = new EmailRequest("user@example.com", "subject", "body");

        when(authService.forgotPassword(any(EmailRequest.class)))
                .thenReturn("Reset link sent to your email.");

        mockMvc.perform(post("/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Reset link sent to your email."));
    }

    @Test
    void testResetPassword_success() throws Exception {
        ResetRequest request = new ResetRequest("token123", "newSecureP@ssword1");

        when(authService.resetPassword(any(ResetRequest.class)))
                .thenReturn("Password has been reset successfully.");

        mockMvc.perform(post("/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Password has been reset successfully."));
    }
}
