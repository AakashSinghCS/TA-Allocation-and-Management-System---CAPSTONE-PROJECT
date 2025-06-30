package com.infinity.courseservice.dtos.EnrollmentDtos;

import com.infinity.courseservice.dtos.UserDtos.StudentDto;
import com.infinity.courseservice.models.Section;

public record EnrollmentDto(Long enrollmentId, StudentDto student, Section section) {}
