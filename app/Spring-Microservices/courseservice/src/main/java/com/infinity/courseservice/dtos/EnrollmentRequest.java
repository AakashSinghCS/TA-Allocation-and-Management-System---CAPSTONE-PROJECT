package com.infinity.courseservice.dtos;

public record EnrollmentRequest(
        Long studentId,
        Long courseId,
        boolean hasCompleted) {

}
