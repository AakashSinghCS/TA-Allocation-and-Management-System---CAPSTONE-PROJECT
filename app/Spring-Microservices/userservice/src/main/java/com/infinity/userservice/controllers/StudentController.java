package com.infinity.userservice.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.userservice.dtos.StudentDto;
import com.infinity.userservice.services.StudentService;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/num/{studentNum}")
    public ResponseEntity<StudentDto> getStudentByNum(@PathVariable Integer studentNum) {
        StudentDto studentDto = studentService.getStudentByNum(studentNum);
        return ResponseEntity.ok(studentDto);
    }
    
    @GetMapping("/{studentId}")
    public ResponseEntity<StudentDto> getStudentById(@PathVariable Long studentId) {
        StudentDto studentDto = studentService.getStudentById(studentId);
        return ResponseEntity.ok(studentDto);
    }
    
}
