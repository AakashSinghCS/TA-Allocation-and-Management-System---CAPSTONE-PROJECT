package com.infinity.applicationservice.feign;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import com.infinity.applicationservice.config.FeignClientInterceptor;
import com.infinity.applicationservice.dtos.Users.UserDto;

@FeignClient(name = "USER-SERVICE", configuration = FeignClientInterceptor.class)
public interface UserInterface {

    @GetMapping("/users/students/{studentId}")
    public ResponseEntity<UserDto> getStudentById(@PathVariable Long studentId);
    
    @GetMapping("/users/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id,  @RequestHeader("X-User-Id") Long requesterId,
            @RequestHeader("X-User-Roles") List<String> roles);
    
    @GetMapping("/users/studentNum/{studentNum}")
    public ResponseEntity<UserDto> getStudentByNum(@PathVariable Integer studentNum);

    @GetMapping("/users/profile/{id}")
    public ResponseEntity<UserDto> getUserDetailsById(@PathVariable Long id,@RequestHeader(name="X-User-Roles", required = true) List<String> headerRoles,
    @RequestHeader(name="X-User-Id", required=false) Long userIdFromHeader);

    @GetMapping("/users/students/batch")
    List<UserDto> getStudentsByIds(@RequestParam List<Long> ids);


}
