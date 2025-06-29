package com.infinity.userservice.dtos.Students;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record StudentUpdateRequest(
        @Email(message = "Email must be valid") String email,
        String firstName,
        String lastName,
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-\\[\\]{}|;:',.<>?]).{8,}$", 
                 message = "Password must contain at least one uppercase letter, one number, and one special character") 
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,
        @Min(10000000)  
        @Max(99999999)
        Integer studentNumber,
        String program,
        Integer enrollmentYear,
        Integer schoolYear) {
}