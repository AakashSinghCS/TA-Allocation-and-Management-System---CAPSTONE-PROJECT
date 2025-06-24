package com.infinity.courseservice.dtos.EnrollmentDtos;

public record EnrollmentRequest(
        Long studentId,
        Long courseId,
        boolean hasCompleted) {

}
