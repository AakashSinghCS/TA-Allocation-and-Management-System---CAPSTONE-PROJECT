package com.infinity.userservice.dtos;

public record LoginRequest(
        String email,
        String password
) {}
