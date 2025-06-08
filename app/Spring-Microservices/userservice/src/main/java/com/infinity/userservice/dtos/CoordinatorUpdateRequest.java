package com.infinity.userservice.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CoordinatorUpdateRequest(
        @Email(message = "Email must be valid") String email,
       String firstName,
        String lastName,
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-\\[\\]{}|;:',.<>?]).{8,}$", 
                 message = "Password must contain at least one uppercase letter, one number, and one special character") 
       @Size(min = 8, message = "Password must be at least 8 characters")
        String password,
        @Pattern(regexp = "STUDENT|INSTRUCTOR|COORDINATOR", message = "User type must be STUDENT, INSTRUCTOR, or COORDINATOR")
        String userType) {
}