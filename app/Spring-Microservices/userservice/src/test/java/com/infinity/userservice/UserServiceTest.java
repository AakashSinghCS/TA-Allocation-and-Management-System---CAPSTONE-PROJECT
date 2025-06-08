package com.infinity.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.infinity.userservice.dtos.RegisterRequest;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.exceptions.BadRequestException;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.Coordinator;
import com.infinity.userservice.models.Instructor;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.models.User;
import com.infinity.userservice.repositories.UserRepository;
import com.infinity.userservice.services.UserService;
import com.infinity.userservice.utility.UserMapper;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserMapper userMapper;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;
    
    @Test
    void testRegisterFailEmailExists() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", "STUDENT");
        User user = new Student("john@test.com", "John", "Smith", "password");
        
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(user));
        assertThrows(BadRequestException.class, () -> {
            userService.register(request);
        });
    }

    @Test
    void testRegisterStudent() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", "STUDENT");

        Student saved = new Student("john@test.com", "John", "Smith", "password");
        UserDto studentDto = new UserDto(1L, "John", "Smith", UserRole.STUDENT);

        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(userMapper.registerToUser(request)).thenReturn(saved);
        when(userMapper.toDto(saved)).thenReturn(studentDto);

        UserDto dto = userService.register(request);

        assertEquals("John", dto.firstName());
        assertEquals(UserRole.STUDENT, dto.role());
    }
    
    @Test
    void testRegisterInstructor() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", "INSTRUCTOR");

        Instructor saved = new Instructor("john@test.com", "John", "Smith", "password");
        UserDto studentDto = new UserDto(1L, "John", "Smith", UserRole.INSTRUCTOR);

        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(userMapper.registerToUser(request)).thenReturn(saved);
        when(userMapper.toDto(saved)).thenReturn(studentDto);

        UserDto dto = userService.register(request);

        assertEquals("John", dto.firstName());
        assertEquals(UserRole.INSTRUCTOR, dto.role());
    }

    @Test
    void testRegisterCoordinator() {
        RegisterRequest request = new RegisterRequest("john@test.com", "John", "Smith", "P@ssword1", "COORDINATOR");

        Coordinator saved = new Coordinator("john@test.com", "John", "Smith", "password");
        UserDto studentDto = new UserDto(1L, "John", "Smith", UserRole.COORDINATOR);

        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(userMapper.registerToUser(request)).thenReturn(saved);
        when(userMapper.toDto(saved)).thenReturn(studentDto);

        UserDto dto = userService.register(request);

        assertEquals("John", dto.firstName());
        assertEquals(UserRole.COORDINATOR, dto.role());
    }

    @Test
    void testGetUserByIdError() {
        Long userId = 1L;
        when(userRepository.findById(any())).thenReturn(Optional.empty());

        NotFoundException e = assertThrows(NotFoundException.class, () -> {
        userService.getUserById(userId);
        });

        assertEquals("User with ID 1 not found", e.getMessage());
    }
    
    @Test
    void testGetUserByIdSuccess() {
        User mockUser = new Coordinator("john@test.com", "John", "Smith", "password");
        UserDto mockDto = new UserDto(1L, "John", "Smith", UserRole.COORDINATOR);

        when(userRepository.findById(any())).thenReturn(Optional.of(mockUser));
        when(userMapper.toDto(mockUser)).thenReturn(mockDto);

        UserDto dto = userService.getUserById(1L);
        assertEquals(dto.firstName(), "John");
        assertEquals(dto.role(), UserRole.COORDINATOR);
    }

}
