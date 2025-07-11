package com.infinity.applicationservice.dtos.Applications;

import java.util.List;
import java.util.Set;

import com.infinity.applicationservice.enums.ApplicationType;
import com.infinity.applicationservice.enums.Subject;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ApplicationRequest(
        @Size(min = 1, max = 3, message = "At least one and at most three subject preferences allowed") @NotNull(message = "Need at least one preference") List<Subject> preferences,
        @NotNull ApplicationType applicationType,
        @NotNull(message = "Remote work preference not specified") boolean wantRemote,
        @NotNull(message = "Working hour preferences not specified") @Min(value = 2, message = "The value must be greater than or equal to 2") @Max(value = 30, message = "The value must be less than or equal to 30") Integer wantWorkingHours,
        Set<AvailabilityDto> availabilities) {
}