package com.infinity.userservice.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id,  @RequestHeader("X-User-Id") Long requesterId,
    @RequestHeader("X-User-Roles") List<String> roles) {
        UserDto userDto = userService.getUserById(id, requesterId, roles);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("update/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id,
            @RequestHeader("X-User-Id") Long requesterId,
            @RequestHeader("X-User-Roles") List<String> roles,
            @RequestBody Map<String, Object> payload) {

        userService.updateUserById(id, requesterId, roles, payload);
        return ResponseEntity.ok("User updated");
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<String> deleteUserById(@PathVariable Long id,
            @RequestHeader("X-User-Id") Long userIdFromHeader, @RequestHeader("X-User-Roles") List<String> roles) {
        userService.deleteUserById(id, userIdFromHeader, roles);
        return ResponseEntity.ok("User deleted");
    }
}