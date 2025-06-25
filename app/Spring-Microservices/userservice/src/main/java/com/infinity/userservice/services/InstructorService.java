package com.infinity.userservice.services;

import org.springframework.stereotype.Service;

import com.infinity.userservice.dtos.Instructors.InstructorDto;
import com.infinity.userservice.dtos.Students.StudentDto;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.Instructor;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.repositories.InstructorRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InstructorService {

    private final InstructorRepository instructorRepository;
    
    public InstructorDto getInstructorById(Long id) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Instructor with " + id + " not found"));
        return studentMapper.toDto(student);
    }
}
