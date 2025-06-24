package com.infinity.userservice.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.userservice.dtos.InstructorDto;
import com.infinity.userservice.services.InstructorService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/instructors")
public class InstructorController {
    private final InstructorService instructorService;

    @GetMapping("/{instructorId}")
    public ResponseEntity<InstructorDto> getInstructorById(@PathVariable Long instructorId) {
        InstructorDto instructorDto = instructorService.getInstructorById(instructorId);
        return ResponseEntity.ok(instructorDto);
    }
    
}
