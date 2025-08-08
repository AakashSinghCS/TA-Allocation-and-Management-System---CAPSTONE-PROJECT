package com.infinity.userservice.controllers;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.userservice.dtos.RoleChangeRequest;
import com.infinity.userservice.dtos.UserDto;
import com.infinity.userservice.dtos.UserUpdateRequest;
import com.infinity.userservice.dtos.Registration.RegisterRequest;
import com.infinity.userservice.services.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id, @RequestHeader("X-User-Id") Long requesterId,
            @RequestHeader("X-User-Roles") List<String> roles) {
        UserDto userDto = userService.getUserById(id, requesterId, roles);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("update/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Long id,
            @RequestHeader("X-User-Id") Long requesterId,
            @RequestHeader("X-User-Roles") List<String> roles,
            @RequestBody @Valid UserUpdateRequest request) {

        userService.updateUserById(id, requesterId, roles, request);
        return ResponseEntity.ok("User updated");
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<String> deleteUserById(@PathVariable Long id,
            @RequestHeader("X-User-Id") Long userIdFromHeader, @RequestHeader("X-User-Roles") List<String> roles) {
        userService.deleteUserById(id, userIdFromHeader, roles);
        return ResponseEntity.ok("User deleted");
    }


    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    @GetMapping("/search/page")
    public Page<UserDto> searchUsersByPage(
            Pageable pageable,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String firstname,
            @RequestParam(required = false) String lastname,
            @RequestParam(required = false) String universityNumber,
            @RequestParam(required = false) String userId) {
        return userService.searchUsersByPage(pageable, role, firstname, lastname, universityNumber, userId);
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @GetMapping("/search")
     public ResponseEntity<List<UserDto>> searchUsers(
        @RequestParam(required = false) String role,
            @RequestParam(required = false, defaultValue = "") String firstname,
            @RequestParam(required = false, defaultValue = "") String lastname,
            @RequestParam(required = false, defaultValue = "0") int universityNumber,
            @RequestParam(required = false) Long userId) {

         List<UserDto> results = userService.search(role, firstname, lastname, universityNumber, userId);

         return ResponseEntity.ok(results);
     }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/changeRole/{id}")
    public ResponseEntity<UserDto> changeRole(@PathVariable Long id, @RequestBody RoleChangeRequest request,
            @RequestHeader("X-User-Id") Long userIdFromHeader) {
        return ResponseEntity.ok(userService.changeRole(id, request, userIdFromHeader));
    }

    @GetMapping("/studentNum/{studentNum}")
    public ResponseEntity<UserDto> getStudentByNum(@PathVariable Integer studentNum) {
        return ResponseEntity.ok(userService.getStudentByNum(studentNum));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<UserDto> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getStudentById(id));
    }

    @GetMapping("/instructors/{id}")
    public ResponseEntity<UserDto> getInstructorById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getInstructorById(id));
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<UserDto> getUserDetailsById(@PathVariable Long id,
        @RequestHeader(name="X-User-Roles", required=true) List<String> roles,
        @RequestHeader(name="X-User-Id", required=false) Long userIdFromHeader) {
        return ResponseEntity.ok(userService.getUserDetailsById(id, roles, userIdFromHeader));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/register")
    public ResponseEntity<UserDto> manualAddUser(@RequestBody @Valid RegisterRequest request,
            @RequestHeader(name = "X-User-Id", required = false) Long userIdFromHeader) {
        UserDto userDto = userService.register(request, userIdFromHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(userDto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/activate/{id}")
    public ResponseEntity<String> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.activateUser(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/deactivate/{id}")
    public ResponseEntity<String> deactivateUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deactivateUser(id));
    }

    @GetMapping("/students/batch")
    public ResponseEntity<List<UserDto>> getStudentsByIds(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(userService.getStudentsByIds(ids));
    }

}