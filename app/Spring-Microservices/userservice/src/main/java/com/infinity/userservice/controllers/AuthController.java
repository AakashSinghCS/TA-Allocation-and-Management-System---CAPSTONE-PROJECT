package com.infinity.userservice.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.userservice.dtos.EmailRequest;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.Registration.LoginRequest;
import com.infinity.userservice.dtos.Registration.LoginResponse;
import com.infinity.userservice.dtos.Registration.RegisterRequest;
import com.infinity.userservice.dtos.Registration.ResetRequest;
import com.infinity.userservice.services.AuthService;
import com.infinity.userservice.services.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

     @PostMapping("/register")
     public ResponseEntity<UserDto> addUser(@RequestBody @Valid RegisterRequest request) {
         UserDto userDto = userService.register(request);
         return ResponseEntity.status(HttpStatus.CREATED).body(userDto);
     }
    
     @PostMapping("/forgot-password")
     public ResponseEntity<String> forgotPassword(@RequestBody EmailRequest request) {
         return ResponseEntity.ok(authService.forgotPassword(request));
     }

     @PostMapping("/reset-password")
     public ResponseEntity<String> resetPassword(@RequestBody @Valid ResetRequest request) {
         return ResponseEntity.ok(authService.resetPassword(request));
     }

}