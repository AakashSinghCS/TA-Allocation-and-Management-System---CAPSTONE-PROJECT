package com.infinity.applicationservice.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.applicationservice.dtos.ApplicationDto;
import com.infinity.applicationservice.dtos.ApplicationRequest;
import com.infinity.applicationservice.services.ApplicationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequiredArgsConstructor
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/add")
    public ResponseEntity<ApplicationDto> submitApplication(
            @RequestBody @Valid ApplicationRequest req,
            @RequestHeader("X-User-Id") Long requesterId,
            @RequestHeader("X-User-Roles") List<String> roles) {
        return ResponseEntity.ok(applicationService.submitApplication(req, requesterId, roles));
    }

    @GetMapping("/get/{studentId}/{year}")
    public ResponseEntity<ApplicationDto> getApplication(@PathVariable Long studentId,
            @PathVariable Integer year,
            @RequestHeader("X-User-Id") Long requesterId,
            @RequestHeader("X-User-Roles") List<String> roles) {
        return ResponseEntity.ok(applicationService.getApplication(studentId, year, requesterId, roles));
    }

    @PutMapping("update/{studentId}")
    public ResponseEntity<ApplicationDto> updateApplication(@RequestBody @Valid ApplicationRequest req,
            @PathVariable Long studentId,
            @RequestHeader("X-User-Id") Long requesterId,
            @RequestHeader("X-User-Roles") List<String> roles) {
        return ResponseEntity.ok(applicationService.updateApplication(req, studentId, requesterId, roles));
    }

    @DeleteMapping("/delete/{studentId}")
    public ResponseEntity<String> deleteApplication(@PathVariable Long studentId,
            @RequestHeader("X-User-Id") Long requesterId,
            @RequestHeader("X-User-Roles") List<String> roles) {
        return ResponseEntity.ok(applicationService.deleteApplication(studentId, requesterId, roles));
    }

    @GetMapping("/getAll/{studentId}")
    public ResponseEntity<List<ApplicationDto>> getAllApplicationsByStudentId(@PathVariable Long studentId,
            @RequestHeader("X-User-Id") Long requesterId,
            @RequestHeader("X-User-Roles") List<String> roles) {
        return ResponseEntity.ok(applicationService.getAllApplicationsByStudentId(studentId, requesterId, roles));
    }

}
