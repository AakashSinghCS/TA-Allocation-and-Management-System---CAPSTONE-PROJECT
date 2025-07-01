package com.infinity.courseservice.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.courseservice.dtos.QualificationDto;
import com.infinity.courseservice.dtos.QualificationRequest;
import com.infinity.courseservice.dtos.QualificationWithSectionDto;
import com.infinity.courseservice.dtos.StudentQualiRequest;
import com.infinity.courseservice.dtos.StudentQualificationResponseDto;
import com.infinity.courseservice.models.Qualification;
import com.infinity.courseservice.services.QualificationService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Data
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

    @PostMapping("/instructor/addQualification")
    public ResponseEntity<QualificationDto> instructorAddQualification(@RequestBody QualificationRequest request) {
        QualificationDto dto = qualificationService.instructorAddQualification(request);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/instructor/deleteQualification")
    public ResponseEntity<String> instructorDeleteQualification(@RequestBody QualificationRequest request) {
        String result = qualificationService.instructorDeleteQualification(request);
        return ResponseEntity.ok(result);
    }

    

    @GetMapping("/{studentId}/studentUpdateQualification")
    public ResponseEntity<List<QualificationDto>> studentUpdateQualification(@RequestBody StudentQualiRequest request, @PathVariable Long studentId) {
        List<QualificationDto> qualifications = qualificationService.studentUpdateQualifications(request, studentId);
        return ResponseEntity.ok(qualifications);
    }

    @GetMapping("findByStudentId/{studentId}")
    public ResponseEntity<List<StudentQualificationResponseDto>> findByStudentId(@PathVariable Long studentId) {
        List<StudentQualificationResponseDto> qualifications = qualificationService.findQualificationsByStudentId(studentId);
        return ResponseEntity.ok(qualifications);
    }
    
    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<List<QualificationWithSectionDto>> getQualificationsByInstructorId(@PathVariable Long instructorId) {
        List<QualificationWithSectionDto> dtos = qualificationService.findQualificationsByInstructorId(instructorId);
        return ResponseEntity.ok(dtos);
    }
}
