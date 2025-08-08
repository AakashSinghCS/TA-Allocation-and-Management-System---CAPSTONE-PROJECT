package com.infinity.courseservice.dtos.QualificationDtos;

public record QualificationRequest(Long qualiId, Long courseId, Long studentId, String description, String deptCode) {
    
}
