package com.infinity.userservice.services;

import org.springframework.stereotype.Service;

import com.infinity.userservice.dtos.Instructors.InstructorDto;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.Instructor;
import com.infinity.userservice.repositories.InstructorRepository;
import com.infinity.userservice.utility.InstructorMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InstructorService {

    private final InstructorRepository instructorRepository;
    private final InstructorMapper instructorMapper;
    
    public InstructorDto getInstructorById(Long id) {
        Instructor instructor = instructorRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Instructor with " + id + " not found"));
        return instructorMapper.toDto(instructor);
    }
}
