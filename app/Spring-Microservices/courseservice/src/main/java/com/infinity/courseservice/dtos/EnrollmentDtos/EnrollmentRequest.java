package com.infinity.courseservice.dtos.EnrollmentDtos;

import com.infinity.courseservice.enums.EnrollmentStatus;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record EnrollmentRequest(
                Long studentId,
                Long courseId,
                @Nullable Long sectionId,
                EnrollmentStatus status,
                @Nullable 
                @Min(value = 0, message = "Can't have negative grade") 
                @Max(value = 100, message = "Can't have grade over 100") 
                Integer grade,
                @Nullable 
                @Min(value = 0, message = "Can't have negative grade") 
                @Max(value = 100, message = "Can't have grade over 100") 
                Integer classAvg) {}
