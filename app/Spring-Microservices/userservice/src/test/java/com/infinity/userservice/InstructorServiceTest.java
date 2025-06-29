package com.infinity.userservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import com.infinity.userservice.dtos.Instructors.InstructorDto;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.Instructor;
import com.infinity.userservice.repositories.InstructorRepository;
import com.infinity.userservice.services.InstructorService;
import com.infinity.userservice.utility.InstructorMapper;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class InstructorServiceTest {

    @Mock
    private InstructorRepository instructorRepository;

    @Mock
    private InstructorMapper instructorMapper;

    @InjectMocks
    private InstructorService instructorService;

    @Test
    void testGetInstructorById_Success() {
        Instructor instructor = new Instructor("jane@test.com", "Jane", "Doe", "password123");
        instructor.setId(1L);
        instructor.setEmployeeNumber(1234);
        instructor.setDepartment("Math");
        instructor.setCreatedAt(LocalDateTime.of(2023, 1, 1, 10, 0));

        InstructorDto dto = new InstructorDto(1L, "Jane", "Doe", "jane@test.com", 1234, "Math", instructor.getCreatedAt());

        when(instructorRepository.findById(1L)).thenReturn(Optional.of(instructor));
        when(instructorMapper.toDto(instructor)).thenReturn(dto);

        InstructorDto result = instructorService.getInstructorById(1L);

        assertEquals(dto.id(), result.id());
        assertEquals(dto.firstName(), result.firstName());
    }

    @Test
    void testGetInstructorById_NotFound() {
        when(instructorRepository.findById(99L)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class, () -> instructorService.getInstructorById(99L));
        assertEquals("Instructor with 99 not found", ex.getMessage());
    }
}
