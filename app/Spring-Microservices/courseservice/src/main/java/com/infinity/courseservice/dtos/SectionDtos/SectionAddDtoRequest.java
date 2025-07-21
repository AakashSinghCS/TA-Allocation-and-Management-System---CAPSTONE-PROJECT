package com.infinity.courseservice.dtos.SectionDtos;

import java.util.List;

import com.infinity.courseservice.dtos.SemesterDto;
import com.infinity.courseservice.enums.SectionType;

import io.micrometer.common.lang.Nullable;
import jakarta.validation.constraints.Pattern;

public record SectionAddDtoRequest(
        @Nullable 
        @Pattern(regexp = "^[A-Z]{4}$",
             message = "Dept code must be 4 uppercase letters")
        String deptCode,
        
        @Nullable String name,

        @Nullable 
        @Pattern(regexp = "^[0-9]{3}$",
             message = "Course number must be 3 digits")
        String courseNum,

        @Nullable 
        @Pattern(regexp = "^[A-Z0-9]{3}$",
             message = "Section code must be 3 uppercase letters/digits")
        String section,

        @Nullable SectionType type,

        @Nullable SemesterDto semester,

        @Nullable List<SectionScheduleDto> sectionSchedules,
        @Nullable Long instructorId
        ) {}
