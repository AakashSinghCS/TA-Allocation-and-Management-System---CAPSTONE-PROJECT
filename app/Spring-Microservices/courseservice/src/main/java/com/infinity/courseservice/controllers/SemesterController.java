package com.infinity.courseservice.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.courseservice.dtos.Semesters.SemesterDto;
import com.infinity.courseservice.services.SemesterService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/semesters")
@RequiredArgsConstructor
public class SemesterController {

    private final SemesterService semesterService;
    
    @GetMapping("/{id}")
    public ResponseEntity<SemesterDto> getSemesterById(@PathVariable Long id) {
        return ResponseEntity.ok(semesterService.getSemesterById(id));
    }

    @GetMapping("/{year}/{semester}")
    public ResponseEntity<SemesterDto> getSemesterByYearAndSemester(@PathVariable Integer year,
            @PathVariable String semester) {
        return ResponseEntity.ok(semesterService.getSemesterByYearAndSemester(year, semester));
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<SemesterDto>> getAllSemesters() {
        return ResponseEntity.ok(semesterService.getAllSemesters());
    }

    @GetMapping("/getAllFuture")
    public ResponseEntity<List<SemesterDto>> getAllFutureSemesters() {
        return ResponseEntity.ok(semesterService.getAllFutureSemesters());
    }

    @GetMapping("/getActive")
    public ResponseEntity<List<SemesterDto>> getActiveSemesters() {
        return ResponseEntity.ok(semesterService.getSemestersByState(true));
    }

    @GetMapping("/getInactive")
    public ResponseEntity<List<SemesterDto>> getInactiveSemesters() {
        return ResponseEntity.ok(semesterService.getSemestersByState(false));
    }

    @PostMapping("/add")
    public ResponseEntity<SemesterDto> addSemester(@RequestBody @Valid SemesterDto request
    ,@RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        return ResponseEntity.ok(semesterService.addSemester(request, userIdFromHeader));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<SemesterDto> updateSemester(@PathVariable Long id,
            @RequestBody @Valid SemesterDto request,
            @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        return ResponseEntity.ok(semesterService.updateSemester(id, request,userIdFromHeader));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteSemester(@PathVariable Long id,
    @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        return ResponseEntity.ok(semesterService.deleteSemester(id,userIdFromHeader));
    }
}
