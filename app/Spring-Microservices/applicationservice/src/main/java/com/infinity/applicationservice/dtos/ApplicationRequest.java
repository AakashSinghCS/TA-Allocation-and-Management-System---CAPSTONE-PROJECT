package com.infinity.applicationservice.dtos;

import java.util.List;

import com.infinity.applicationservice.enums.Subject;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ApplicationRequest(
                List<Subject> preferences,
                @NotNull(message = "Remote work preference not specified") 
                boolean wantRemote,
                @NotNull(message = "Working hour preferences not specified")
                @Min(value = 2, message = "The value must be greater than or equal to 2")
                @Max(value = 12, message = "The value must be less than or equal to 12")
                Integer wantWorkingHours) {
}