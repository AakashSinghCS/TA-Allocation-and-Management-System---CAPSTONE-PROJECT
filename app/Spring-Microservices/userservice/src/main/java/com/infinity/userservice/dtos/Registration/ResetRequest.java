package com.infinity.userservice.dtos.Registration;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetRequest(String token,
        @NotBlank(message = "Password is required") 
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-\\[\\]{}|;:',.<>?]).{8,}$", 
                message = "Password must contain at least one uppercase letter, one number, and one special character") 
        @Size(min = 8, message = "Password must be at least 8 characters")      
        String newPassword) {

}
