package com.infinity.courseservice.controllers;
import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
    public ExamDto createExam(@RequestBody ExamDto dto) {
        return examService.createExam(dto);
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
    public ExamDto updateExam(@PathVariable Long id, @RequestBody ExamDto dto) {
        return examService.updateExam(id, dto);
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @DeleteMapping("/{id}")
    public void deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
    }

    // ===============================
    // Exam Availability
    // ===============================

    @PostMapping("/{studentId}/availability")
    public void updateAvailability(
            @PathVariable Long studentId,
            @RequestBody List<ExamAvailabilityDto> availabilityDtos) {
        examService.updateStudentAvailability(studentId, availabilityDtos);
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
            @RequestBody ExamAssignmentDto assignmentDto) {
        return examService.assignStudentToExam(examId, assignmentDto.studentId(), assignmentDto.task());
    }

    @GetMapping("/{studentId}/assignments")
    public List<ExamAssignmentDto> getAssignments(
            @PathVariable Long studentId) {
        return examService.getAssignmentsByStudentId(studentId);
    }
}
