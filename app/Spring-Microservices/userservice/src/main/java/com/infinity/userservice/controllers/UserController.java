package com.infinity.userservice.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.models.User;
import com.infinity.userservice.services.UserService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Data
public class UserController {

    private final UserService userService;

    @GetMapping("/test")
    public String apiTest() {
        return "Test";
    }
    
    @PostMapping("/add")
    public UserDto addUser(@RequestBody User user) {
        return userService.addUser(user);
    }
}
