package com.infinity.profileservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.infinity.profileservice.config.FeignClientInterceptor;
import com.infinity.profileservice.dtos.UserDto;

@FeignClient(name = "USER-SERVICE", configuration = FeignClientInterceptor.class)
public interface UserInterface {

    @GetMapping("/users/profile/{id}")
    public ResponseEntity<UserDto> getUserDetailsById(@PathVariable Long id);
}
