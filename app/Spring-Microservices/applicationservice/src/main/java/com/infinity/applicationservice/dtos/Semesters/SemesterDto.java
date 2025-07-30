package com.infinity.applicationservice.dtos.Semesters;

import java.time.LocalDate;

import io.micrometer.common.lang.Nullable;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

public record SemesterDto(
    Long id,
    @Nullable 
    @Min(value = 1900, message = "Year must be ≥ 1900")
    @Max(value = 2199, message = "Year must be ≤ 2199")
    Integer year,
    @Nullable 
    @Pattern(regexp = "^[WS][12]$",
    message = "Semester must be W1/W2/S1/S2")
    String semester,
    LocalDate startDate,
    LocalDate endDate,
    boolean isActive
) {

}
