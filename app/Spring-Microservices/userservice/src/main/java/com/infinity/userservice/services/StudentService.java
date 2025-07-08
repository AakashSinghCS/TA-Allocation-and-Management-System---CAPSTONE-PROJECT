package com.infinity.userservice.services;

import org.springframework.stereotype.Service;

import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.Student;
import com.infinity.userservice.repositories.StudentRepository;
import com.infinity.userservice.utility.UserMapper;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Service
@Data
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserMapper userMapper;

    public UserDto getStudentByStudentNum(Integer studentNum) {
        Student student = studentRepository.findByStudentNum(studentNum)
                .orElseThrow(() -> new NotFoundException("User with student number " + studentNum + " not found"));
        return userMapper.toDto(student);
    }
}
