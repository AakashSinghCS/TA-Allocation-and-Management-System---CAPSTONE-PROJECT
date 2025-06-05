package com.infinity.userservice.dtos;

public record RegisterRequest(String email,
                String firstName,
                String lastName,
                String password,
                String userType,
                Integer studentNumber) {
}
