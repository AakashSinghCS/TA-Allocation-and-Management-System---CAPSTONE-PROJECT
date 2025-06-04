package com.infinity.userservice.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.services.StudentService;

import lombok.Data;
import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@Data
@RequestMapping("/students")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/{studentNum}")
    public ResponseEntity<UserDto> getStudentById(@PathVariable Integer studentNum) {
        UserDto userDto = studentService.getStudentById(studentNum);
        return ResponseEntity.ok(userDto);
    }
    
}
