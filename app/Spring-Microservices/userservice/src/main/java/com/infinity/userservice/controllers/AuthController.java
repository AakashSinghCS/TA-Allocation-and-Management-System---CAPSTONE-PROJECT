package com.infinity.userservice.controllers;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.Registration.LoginRequest;
import com.infinity.userservice.dtos.Registration.LoginResponse;
import com.infinity.userservice.dtos.Registration.RegisterRequest;
import com.infinity.userservice.models.User;
import com.infinity.userservice.security.JwtUtil;
import com.infinity.userservice.services.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = (User) auth.getPrincipal();
        List<String> roles = user.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());

        String token = jwtUtil.generateToken(request.email(), user.getId(), roles);
        return ResponseEntity.ok(new LoginResponse(token));
    }

     @PostMapping("/register")
    public ResponseEntity<UserDto> addUser(@RequestBody @Valid RegisterRequest request) {
        UserDto userDto = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(userDto);
    }

}
