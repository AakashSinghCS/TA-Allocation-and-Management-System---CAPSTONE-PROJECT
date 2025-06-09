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

import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.repositories.StudentRepository;
import com.infinity.userservice.services.StudentService;
import com.infinity.userservice.utility.UserMapper;

@ExtendWith(MockitoExtension.class)
public class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    StudentService studentService;

    @Test
    void testGetUserByIdError() {
        Integer studentNum = 1;
        when(studentRepository.findByStudentNum(any())).thenReturn(Optional.empty());

        NotFoundException e = assertThrows(NotFoundException.class, () -> {
        studentService.getStudentByStudentNum(studentNum);
        });

        assertEquals("User with student number 1 not found", e.getMessage());
    }
    
    @Test
    void testGetUserByIdSuccess() {
        Student mockUser = new Student("john@example.com", "John", "Smith", "password");
        mockUser.setStudentNum(1);
        UserDto mockDto = new UserDto(1L, "John", "Smith", UserRole.STUDENT);

        when(studentRepository.findByStudentNum(any())).thenReturn(Optional.of(mockUser));
        when(userMapper.toDto(mockUser)).thenReturn(mockDto);

        UserDto dto = studentService.getStudentByStudentNum(1);
        assertEquals(dto.firstName(), "John");
        assertEquals(dto.role(), UserRole.STUDENT);
    }
    
}
