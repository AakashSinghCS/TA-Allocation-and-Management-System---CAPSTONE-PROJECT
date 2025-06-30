package com.infinity.courseservice.dtos;

public record EnrollmentRequest(
        Long studentId,
        Long sectionId,
        Integer grade) {

}
