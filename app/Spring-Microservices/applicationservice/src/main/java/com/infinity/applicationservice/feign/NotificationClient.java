package com.infinity.applicationservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.infinity.applicationservice.dtos.Notifications.EmailRequest;

@FeignClient(name = "NOTIFICATION-SERVICE")
public interface NotificationClient {
     @PostMapping("/public/email")
     public ResponseEntity<String> sendEmail(@RequestBody EmailRequest request);
}
