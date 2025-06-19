package com.infinity.courseservice.dtos;

import com.infinity.courseservice.models.Section;

public record EnrollmentDto(Long enrollmentId, StudentDto student, Section section) {}
