package com.infinity.applicationservice.dtos;

import java.util.List;

import com.infinity.applicationservice.enums.Subject;

import jakarta.validation.constraints.NotBlank;

public record ApplicationRequest(
        List<Subject> preferences,
        @NotBlank(message = "Remote work preference not specified") 
        boolean wantRemote,
        @NotBlank(message = "Preferred number of work hours not specified") 
        Integer wantWorkingHours

) {
}
