package com.infinity.userservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.infinity.userservice.config.FeignClientInterceptor;
import com.infinity.userservice.dtos.EmailRequest;

@FeignClient(name = "NOTIFICATION-SERVICE", configuration = FeignClientInterceptor.class)
public interface NotificationClient {
    @PostMapping("/public/email")
    void sendEmail(@RequestBody EmailRequest request);
}
