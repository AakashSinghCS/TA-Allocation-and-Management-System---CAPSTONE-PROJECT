package com.infinity.courseservice.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.courseservice.dtos.EnrollmentRequest;
import com.infinity.courseservice.services.EnrollmentService;

import lombok.Data;
import lombok.RequiredArgsConstructor;



@RestController
@RequiredArgsConstructor
@Data
@RequestMapping("/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/enrollStudent")
    public ResponseEntity<String> enrollStudent(@RequestBody EnrollmentRequest request) {
        enrollmentService.enrollStudent(request);
        return ResponseEntity.ok("Successfully enrolled");
    }   
    
}
