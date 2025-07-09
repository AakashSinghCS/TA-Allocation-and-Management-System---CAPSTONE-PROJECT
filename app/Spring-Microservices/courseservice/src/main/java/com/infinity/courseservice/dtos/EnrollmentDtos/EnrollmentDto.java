package com.infinity.courseservice.dtos.EnrollmentDtos;

import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.models.Section;

public record EnrollmentDto(Long enrollmentId, UserDto student, Section section) {}
