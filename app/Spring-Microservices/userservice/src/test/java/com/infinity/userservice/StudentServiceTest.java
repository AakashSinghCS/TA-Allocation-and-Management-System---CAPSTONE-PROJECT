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

import com.infinity.userservice.dtos.Students.StudentDto;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.repositories.StudentRepository;
import com.infinity.userservice.services.StudentService;
import com.infinity.userservice.utility.StudentMapper;

@ExtendWith(MockitoExtension.class)
public class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private StudentMapper studentMapper;

    @InjectMocks
    StudentService studentService;

    @Test
    void testGetStudentByIdError() {
        Long studentId = 1L;
        when(studentRepository.findById(any())).thenReturn(Optional.empty());

        NotFoundException e = assertThrows(NotFoundException.class, () -> {
        studentService.getStudentById(studentId);
        });

        assertEquals("User with student number 1 not found", e.getMessage());
    }
    
    @Test
    void testGetUserByIdSuccess() {
        Student mockStudent = new Student(
                "john@example.com",
                "John",
                "Smith",
                "P@ssword1",
                12345678,
                "Computer Science",
                2021,
                3);
        mockStudent.setId(1L);
        StudentDto mockDto = new StudentDto(
                mockStudent.getId(),
                mockStudent.getFirstName(),
                mockStudent.getLastName(),
                mockStudent.getStudentNum(),
                mockStudent.getProgram(),
                mockStudent.getEnrollmentYear(),
                mockStudent.getSchoolYear(),
                mockStudent.getCreatedAt());

        when(studentRepository.findById(any())).thenReturn(Optional.of(mockStudent));
        when(studentMapper.toDto(mockStudent)).thenReturn(mockDto);

        StudentDto dto = studentService.getStudentById(1L);
        assertEquals(dto.firstName(), "John");
    }
    
    @Test
    void testGetStudentByNumSuccess() {
        Student mockStudent = new Student(
                "jane@example.com",
                "Jane",
                "Doe",
                "SecurePass123",
                87654321,
                "Math",
                2020,
                4);
        mockStudent.setId(2L);

        StudentDto mockDto = new StudentDto(
                mockStudent.getId(),
                mockStudent.getFirstName(),
                mockStudent.getLastName(),
                mockStudent.getStudentNum(),
                mockStudent.getProgram(),
                mockStudent.getEnrollmentYear(),
                mockStudent.getSchoolYear(),
                mockStudent.getCreatedAt());

        when(studentRepository.findByStudentNum(87654321)).thenReturn(Optional.of(mockStudent));
        when(studentMapper.toDto(mockStudent)).thenReturn(mockDto);

        StudentDto result = studentService.getStudentByNum(87654321);

        assertEquals("Jane", result.firstName());
        assertEquals("Doe", result.lastName());
        assertEquals(87654321, result.studentNum());
    }

    @Test
    void testGetStudentByNumNotFound() {
        when(studentRepository.findByStudentNum(11111111)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> studentService.getStudentByNum(11111111));

        assertEquals("User with student number 11111111 not found", ex.getMessage());
    }
    
}
