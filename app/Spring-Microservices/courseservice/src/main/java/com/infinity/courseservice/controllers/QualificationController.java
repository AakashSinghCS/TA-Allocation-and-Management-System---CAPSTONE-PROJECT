package com.infinity.courseservice.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.courseservice.dtos.QualificationDtos.QualificationDto;
import com.infinity.courseservice.dtos.QualificationDtos.QualificationDto;
import com.infinity.courseservice.dtos.QualificationDtos.QualificationRequest;
import com.infinity.courseservice.dtos.QualificationDtos.QualificationWithSectionDto;
import com.infinity.courseservice.dtos.QualificationDtos.StudentQualiRequest;
import com.infinity.courseservice.services.QualificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/qualifications")
public class QualificationController {
    private final QualificationService qualificationService;

    
    @GetMapping("/ping")
    public String ping() { return "OK"; }

    @GetMapping("/{id}")
    public ResponseEntity<QualificationDto> getQualification(@PathVariable Long id) {
        QualificationDto dto = qualificationService.findQualification(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/byDepartment/{deptCode}")
    public ResponseEntity<List<QualificationDto>> getQualificationsByDeptCode(@PathVariable String deptCode) {
        List<QualificationDto> qualis = qualificationService.findQualificationsByDeptCode(deptCode);
        return ResponseEntity.ok(qualis);
    }

    @PreAuthorize("hasAnyRole('COORDINATOR', 'INSTRUCTOR')")
    @PostMapping("/instructor/addQualification")
    public ResponseEntity<QualificationDto> instructorAddQualification(@RequestBody QualificationRequest request) {
        QualificationDto dto = qualificationService.instructorAddQualification(request);
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasAnyRole('COORDINATOR', 'INSTRUCTOR')")
    @DeleteMapping("/instructor/deleteQualification/{id}")
    public ResponseEntity<List<Long>> instructorDeleteQualification(@PathVariable Long id) {
        List<Long> result = qualificationService.instructorDeleteQualification(id);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{studentId}/studentUpdateQualification")
    public ResponseEntity<List<QualificationDto>> studentUpdateQualification(@RequestBody StudentQualiRequest request, @PathVariable Long studentId) {
        List<QualificationDto> qualifications = qualificationService.studentUpdateQualifications(request, studentId);
        return ResponseEntity.ok(qualifications);
    }

    @GetMapping("findByStudentId/{studentId}")
    public ResponseEntity<List<Long>> findByStudentId(@PathVariable Long studentId) {
        List<Long> qualifications = qualificationService.findQualificationsByStudentId(studentId);
        return ResponseEntity.ok(qualifications);
    }
    

    @PreAuthorize("hasAnyRole('COORDINATOR', 'INSTRUCTOR')")
    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<QualificationWithSectionDto>> getQualificationsByInstructorId(@PathVariable Long instructorId) {
        List<QualificationWithSectionDto> dtos = qualificationService.findQualificationsByInstructorId(instructorId);
        return ResponseEntity.ok(dtos);
    }
}
