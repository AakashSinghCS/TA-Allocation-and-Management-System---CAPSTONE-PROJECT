package com.infinity.userservice.controllers;

import java.nio.file.AccessDeniedException;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.services.UserService;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;


@RestController
@RequiredArgsConstructor
@Data
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @PreAuthorize("hasRole('COORDINATOR')")
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto userDto = userService.getUserById(id);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("update/{id}")
    public ResponseEntity<UserDto> putMethodName(@PathVariable String id, @RequestBody String entity) {
        UserDto userDto = userService.updateUserById(id);
        return ResponseEntity.ok(userDto);
    }
    
    @DeleteMapping("delete/{id}")
    public ResponseEntity<String> deleteUserById(@PathVariable Long id,
            @RequestHeader("X-User-Id") Long userIdFromHeader, @RequestHeader("X-User-Roles") List<String> roles) {
        userService.deleteUserById(id, userIdFromHeader, roles);
        return ResponseEntity.ok("User deleted");
    }
}
