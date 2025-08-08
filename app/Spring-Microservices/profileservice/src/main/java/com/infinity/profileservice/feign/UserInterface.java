package com.infinity.profileservice.feign;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import com.infinity.profileservice.config.FeignClientInterceptor;
import com.infinity.profileservice.dtos.UserDto;

@FeignClient(name = "USER-SERVICE", configuration = FeignClientInterceptor.class)
public interface UserInterface {

    @GetMapping("/users/profile/{id}")
    public ResponseEntity<UserDto> getUserDetailsById(@PathVariable Long id, 
    @RequestHeader(name="X-User-Roles", required=true) List<String> headerRoles,
    @RequestHeader(name="X-User-Id", required=false) Long userIdFromHeader);
}
