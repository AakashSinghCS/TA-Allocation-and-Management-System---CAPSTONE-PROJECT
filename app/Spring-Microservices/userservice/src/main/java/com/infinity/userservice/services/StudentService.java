package com.infinity.userservice.services;

import org.springframework.stereotype.Service;

import com.infinity.userservice.dtos.Students.StudentDto;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.repositories.StudentRepository;
import com.infinity.userservice.utility.StudentMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;

    public StudentDto getStudentByNumber(Integer studentNumber) {
        Student student = studentRepository.findByStudentNumber(studentNumber)
                .orElseThrow(() -> new NotFoundException("User with student number " + studentNumber + " not found"));
        return studentMapper.toDto(student);
    }

     public StudentDto getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User with student number " + id + " not found"));
        return studentMapper.toDto(student);
    }
}
