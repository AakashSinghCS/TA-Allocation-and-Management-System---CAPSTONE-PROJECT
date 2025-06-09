package com.infinity.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.infinity.userservice.models.Student;
import com.infinity.userservice.models.User;
import com.infinity.userservice.repositories.UserRepository;
import com.infinity.userservice.security.CustomUserDetailsService;

@ExtendWith(MockitoExtension.class)
public class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    @Test
    void loadUserByUsername_Success() {
        User mockUser = new Student("test@example.com", "John", "Doe", "hashedPassword");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        UserDetails userDetails = userDetailsService.loadUserByUsername("test@example.com");

        assertEquals("test@example.com", userDetails.getUsername());
    }

    @Test
    void loadUserByUsername_NotFound() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername("missing@example.com"));
    }
}
