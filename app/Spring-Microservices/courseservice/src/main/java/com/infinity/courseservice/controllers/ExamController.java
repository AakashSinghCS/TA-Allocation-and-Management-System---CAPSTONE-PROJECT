package com.infinity.courseservice.controllers;
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

import com.infinity.courseservice.dtos.ExamDtos.ExamAssignmentDto;
import com.infinity.courseservice.dtos.ExamDtos.ExamAvailabilityDto;
import com.infinity.courseservice.dtos.ExamDtos.ExamDto;
import com.infinity.courseservice.services.ExamService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    // ===============================
    // Exams CRUD
    // ===============================

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping
    public ExamDto createExam(@RequestBody ExamDto dto,
    @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        return examService.createExam(dto, userIdFromHeader);
    }

    @GetMapping
    public List<ExamDto> getAllExams() {
        return examService.getAllExams();
    }

    @GetMapping("/{id}")
    public ExamDto getExam(@PathVariable Long id) {
        return examService.getExamById(id);
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PutMapping("/{id}")
    public ExamDto updateExam(@PathVariable Long id, @RequestBody ExamDto dto,
    @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        return examService.updateExam(id, dto,userIdFromHeader);
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @DeleteMapping("/{id}")
    public void deleteExam(@PathVariable Long id,
    @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        examService.deleteExam(id,userIdFromHeader);
    }

    // ===============================
    // Exam Availability
    // ===============================

    @PostMapping("/{studentId}/availability")
    public void updateAvailability(
            @PathVariable Long studentId,
            @RequestBody List<ExamAvailabilityDto> availabilityDtos,
            @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        examService.updateStudentAvailability(studentId, availabilityDtos,userIdFromHeader);
    }

    @GetMapping("/{studentId}/availability")
    public List<ExamAvailabilityDto> getAvailability(
            @PathVariable Long studentId) {
        return examService.getAvailabilityByStudentId(studentId);
    }

    // ===============================
    // Exam Assignments
    // ===============================

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/{examId}/assignments")
    public ExamAssignmentDto assignStudentToExam(
            @PathVariable Long examId,
            @RequestBody ExamAssignmentDto assignmentDto,
            @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        return examService.assignStudentToExam(examId, assignmentDto, userIdFromHeader);
    }

    @GetMapping("/assignments/{studentId}")
    public List<ExamAssignmentDto> getAssignments(
            @PathVariable Long studentId) {
        return examService.getAssignmentsByStudentId(studentId);
    }

    @DeleteMapping("/{studentId}/availability")
    public void deleteAvailability(@PathVariable Long studentId,
    @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        examService.deleteAvailabilityByStudentId(studentId,userIdFromHeader);
    }

    @GetMapping("/assignments/byexam/{examId}")
    public List<ExamAssignmentDto> getAssignmentsForExam(@PathVariable Long examId) {
        return examService.getAssignmentsForExam(examId);
    }

    @DeleteMapping("/assignments/{assignmentId}")
    public void unassignStudentFromExam(@PathVariable Long assignmentId,
    @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        examService.unassignStudentFromExam(assignmentId, userIdFromHeader);
    }

    @PutMapping("/assignments/{examId}/student/{studentId}")
    public ResponseEntity<ExamAssignmentDto> updateAssignment(
        @PathVariable Long examId,
        @PathVariable Long studentId,
        @RequestBody ExamAssignmentDto updatedDto,
        @RequestHeader(name="X-User-Id", required = true) Long userIdFromHeader) {
        ExamAssignmentDto updated = examService.updateAssignmentByStudentId(examId, studentId, updatedDto, userIdFromHeader);
        return ResponseEntity.ok(updated);
    }


}
