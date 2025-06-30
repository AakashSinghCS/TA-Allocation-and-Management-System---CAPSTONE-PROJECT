package com.infinity.courseservice.dtos.EnrollmentDtos;

public record EnrollmentRequest(
        Long studentId,
        Long sectionId,
        Integer grade) {

}
