package com.infinity.courseservice.dtos;

public record QualificationRequest(Long qualiId, Long courseId, Long studentId, String description, String deptCode) {
    
}
