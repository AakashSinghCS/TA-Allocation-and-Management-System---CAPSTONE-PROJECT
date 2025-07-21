package com.infinity.applicationservice.controllers;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

import com.infinity.applicationservice.dtos.Applications.ApplicationDto;
import com.infinity.applicationservice.dtos.Applications.ApplicationRequest;
import com.infinity.applicationservice.dtos.Applications.ApplicationWithStudentDto;
import com.infinity.applicationservice.enums.Subject;
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

    @PreAuthorize("hasRole('COORDINATOR')")
    @GetMapping("/getAll")
    public ResponseEntity<List<ApplicationWithStudentDto>> getAllApplications(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Boolean wantRemote,
            @RequestParam(required = false) Integer hours,
            @RequestParam(required = false) Subject preference1,
            @RequestParam(required = false) Subject preference2,
            @RequestParam(required = false) Subject preference3) {
        return ResponseEntity.ok(
                applicationService.getAllApplications(year, wantRemote, hours, preference1, preference2, preference3));
    }

    @GetMapping("/getAll/page")
    public ResponseEntity<Page<ApplicationWithStudentDto>> getAllApplications(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Boolean wantRemote,
            @RequestParam(required = false) Integer hours,
            @RequestParam(required = false) Subject preference1,
            @RequestParam(required = false) Subject preference2,
            @RequestParam(required = false) Subject preference3,
            Pageable pageable) // Spring will map ?page=0&size=5&sort=… here
    {
        Page<ApplicationWithStudentDto> result = applicationService.getAllApplications(
                year, wantRemote, hours, preference1, preference2, preference3, pageable);
        return ResponseEntity.ok(result);
    }

}
