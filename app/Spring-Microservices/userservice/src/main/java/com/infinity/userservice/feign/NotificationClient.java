package com.infinity.userservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.infinity.userservice.dtos.EmailRequest;

@FeignClient(name = "NOTIFICATION-SERVICE")
public interface NotificationClient {
    @PostMapping("/notifications/email")
    void sendEmail(@RequestBody EmailRequest request);
}
