package com.infinity.profileservice.feign;

import com.infinity.profileservice.dtos.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "USER-SERVICE")
public interface UserClient {

    @GetMapping("/students/{studentId}")
    UserDto getStudent(@PathVariable Integer studentId);
}
