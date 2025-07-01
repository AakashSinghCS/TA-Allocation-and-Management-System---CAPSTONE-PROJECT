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

import com.infinity.courseservice.dtos.EnrollmentDtos.ActiveEnrollmentDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.CompletedCourseDto;
import com.infinity.courseservice.dtos.EnrollmentDtos.EnrollmentRequest;
import com.infinity.courseservice.dtos.EnrollmentDtos.StudentEnrollmentOverviewDto;
import com.infinity.courseservice.services.EnrollmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<String> enrollStudent(@RequestBody EnrollmentRequest request) {
        return ResponseEntity.ok(enrollmentService.enrollStudent(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEnrollment(@PathVariable Long id) {
        enrollmentService.deleteEnrollment(id);
        return ResponseEntity.ok("Enrollment deleted");
    }

    @GetMapping("/completed/{studentId}")
    public ResponseEntity<List<CompletedCourseDto>> getCompletedCourses(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getCompletedCourses(studentId));
    }

    @GetMapping("/active/{studentId}")
    public ResponseEntity<List<ActiveEnrollmentDto>> getActiveEnrollments(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getActiveEnrollmentList(studentId));
    }

    @GetMapping("/overview/{studentId}")
    public ResponseEntity<StudentEnrollmentOverviewDto> getEnrollmentOverview(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getFullEnrollmentOverview(studentId));
    }
}
