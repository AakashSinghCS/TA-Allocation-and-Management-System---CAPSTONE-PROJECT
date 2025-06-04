package com.infinity.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infinity.userservice.dtos.RegisterRequest;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.UserRole;
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

    @InjectMocks
    private UserService userService;
    

    @Test
    void testRegisterStudent() {
        RegisterRequest request = new RegisterRequest("john@example.com", "John", "Doe", "STUDENT", 42);

        Student saved = new Student("john@example.com", "John", "Doe", 42);
        UserDto studentDto = new UserDto(Long.valueOf(1), "John", "Doe", UserRole.STUDENT);
        
        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(userMapper.toDto(saved)).thenReturn(studentDto);

        UserDto dto = userService.register(request);

        assertEquals("John", dto.firstName());
        assertEquals(UserRole.STUDENT, dto.role());
    }

}
