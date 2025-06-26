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

import com.infinity.userservice.dtos.InstructorDto;
import com.infinity.userservice.dtos.StudentDto;
import com.infinity.userservice.enums.UserRole;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.Instructor;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.repositories.InstructorRepository;
import com.infinity.userservice.repositories.StudentRepository;
import com.infinity.userservice.services.InstructorService;
import com.infinity.userservice.services.StudentService;
import com.infinity.userservice.utility.InstructorMapper;
import com.infinity.userservice.utility.StudentMapper;

@ExtendWith(MockitoExtension.class)
public class InstructorServiceTest {

    @Mock
    private InstructorRepository instructorRepository;

    @Mock
    private InstructorMapper instructorMapper;

    @InjectMocks
    InstructorService instructorService;

    @Test
    void testGetStudentByIdError() {
        Long instructorId = 1L;
        when(instructorRepository.findById(any())).thenReturn(Optional.empty());

        NotFoundException e = assertThrows(NotFoundException.class, () -> {
        instructorService.getInstructorById(instructorId);
        });

        assertEquals("User with instructor id 1 not found", e.getMessage());
    }
    
    @Test
    void testGetUserByIdSuccess() {
        Instructor mockInstructor = new Instructor(
            "john@example.com", 
            "John", 
            "Smith", 
            "P@ssword1",
            12345678,
            "Computer Science"
        );
        mockInstructor.setId(1L);
        InstructorDto mockDto = new InstructorDto(
            mockInstructor.getId(), 
            mockInstructor.getFirstName(), 
            mockInstructor.getLastName(), 
            mockInstructor.getEmail(),
            mockInstructor.getEmployeeNum(),
            mockInstructor.getDepartment(),
            mockInstructor.getCreatedAt()
        );

        when(instructorRepository.findById(any())).thenReturn(Optional.of(mockInstructor));
        when(instructorMapper.toDto(mockInstructor)).thenReturn(mockDto);

        InstructorDto dto = instructorService.getInstructorById(1L);
        assertEquals(dto.firstName(), "John");
    }
    
}
