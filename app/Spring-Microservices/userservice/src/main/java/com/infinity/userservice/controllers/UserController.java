package com.infinity.userservice.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.userservice.dtos.RegisterRequest;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.services.UserService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Data
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> findUser(@PathVariable Long id) {
        UserDto userDto = userService.findUser(id);
        return ResponseEntity.ok(userDto);
    }
    
    @PostMapping("/register")
    public ResponseEntity<UserDto> addUser(@RequestBody RegisterRequest request) {
        UserDto userDto = userService.register(request);
        return ResponseEntity.ok(userDto);
    }
}
