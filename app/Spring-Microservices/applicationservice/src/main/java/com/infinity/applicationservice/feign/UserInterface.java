package com.infinity.applicationservice.feign;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

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

}
