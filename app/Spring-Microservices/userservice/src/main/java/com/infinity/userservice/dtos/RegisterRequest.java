package com.infinity.userservice.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email(message = "Email must be valid") @NotBlank(message = "Email is required") String email,
        @NotBlank(message = "First name is required") 
        String firstName,
                
        @NotBlank(message = "Last name is required")
        
                
        @NotBlank(message = "Last name is required")
        
        String lastName,
        @NotBlank(message = "Password is required") 
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-\\[\\]{}|;:',.<>?]).{8,}$", 
                message = "Password must contain at least one uppercase letter, one number, and one special character") 
        @Size(min = 8, message = "Password must be at least 8 characters")
        
        String password,
        @NotBlank(message = "User type is required") 
        @Pattern(regexp = "STUDENT|INSTRUCTOR|COORDINATOR", message = "User type must be STUDENT, INSTRUCTOR, or COORDINATOR")
        
        String userType) {
}