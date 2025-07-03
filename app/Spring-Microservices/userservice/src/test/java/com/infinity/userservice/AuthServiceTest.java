package com.infinity.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.infinity.userservice.dtos.EmailRequest;
import com.infinity.userservice.dtos.Registration.LoginRequest;
import com.infinity.userservice.dtos.Registration.LoginResponse;
import com.infinity.userservice.dtos.Registration.ResetRequest;
import com.infinity.userservice.exceptions.BadRequestException;
import com.infinity.userservice.feign.NotificationClient;
import com.infinity.userservice.models.PasswordResetToken;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.models.User;
import com.infinity.userservice.repositories.PasswordResetTokenRepository;
import com.infinity.userservice.repositories.UserRepository;
import com.infinity.userservice.security.JwtUtil;
import com.infinity.userservice.services.AuthService;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {
    
    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private NotificationClient notificationClient;
    
    @InjectMocks
    AuthService authService;

    @SuppressWarnings("unchecked")
    @Test
    void testLogin_success() {
        LoginRequest request = new LoginRequest("user@example.com", "password");
        User mockUser = mock(User.class);

        when(mockUser.getId()).thenReturn(1L);

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(mockUser); 
                                                                  
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(jwtUtil.generateToken(eq("user@example.com"), eq(1L), anyList())).thenReturn("jwt-token");

        LoginResponse response = authService.login(request);

        assertEquals("jwt-token", response.token());

        verify(authenticationManager).authenticate(any());
        verify(jwtUtil).generateToken(eq("user@example.com"), eq(1L), anyList());
    }

    @Test
    void testForgotPassword_userExists() {
        User user = new Student("user@example.com", "First", "Last", "P@ssword1");
        user.setId(1L);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        String response = authService.forgotPassword(new EmailRequest("user@example.com", "", ""));

        verify(tokenRepository).deleteByUser(user);
        verify(tokenRepository).save(any(PasswordResetToken.class));
        verify(notificationClient).sendEmail(any(EmailRequest.class));
        assertTrue(response.contains("Reset link sent"));
    }

    @Test
    void testForgotPassword_userNotExists() {
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        String response = authService.forgotPassword(new EmailRequest("notfound@example.com", "", ""));

        verify(tokenRepository, never()).deleteByUser(any());
        verify(notificationClient, never()).sendEmail(any());
        assertTrue(response.contains("reset link has been sent"));
    }

    @Test
    void testResetPassword_success() {
        User user = new Student("user@example.com", "First", "Last", "OldP@ssword1");
        user.setId(1L);

        PasswordResetToken token = new PasswordResetToken("token123", user, LocalDateTime.now().plusMinutes(5));

        when(tokenRepository.findByToken("token123")).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("newPass")).thenReturn("encodedNew");
        ResetRequest request = new ResetRequest("token123", "newPass");

        String response = authService.resetPassword(request);

        verify(userRepository).save(user);
        verify(tokenRepository).delete(token);
        assertEquals("Password has been reset successfully.", response);
    }

    @Test
    void testResetPassword_tokenExpired() {
        User user = new Student("user@example.com", "First", "Last", "OldP@ssword1");
        PasswordResetToken token = new PasswordResetToken("token123", user, LocalDateTime.now().minusMinutes(1));

        when(tokenRepository.findByToken("token123")).thenReturn(Optional.of(token));

        ResetRequest request = new ResetRequest("token123", "NewP@ssword1");

        assertThrows(BadRequestException.class, () -> authService.resetPassword(request));
        verify(tokenRepository).delete(token);
    }

    @Test
    void testResetPassword_tokenInvalid() {
        when(tokenRepository.findByToken("invalid")).thenReturn(Optional.empty());

        ResetRequest request = new ResetRequest("invalid", "NewP@ssword1");

        assertThrows(BadRequestException.class, () -> authService.resetPassword(request));
    }
}
