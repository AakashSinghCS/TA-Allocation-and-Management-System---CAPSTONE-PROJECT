package com.infinity.profileservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.context.SecurityContextHolder;

import feign.RequestInterceptor;
import feign.RequestTemplate;

@Configuration
public class FeignClientInterceptor implements RequestInterceptor {

    @Override
    public void apply(RequestTemplate template) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String userId = authentication.getName();
            String roles = authentication.getAuthorities().stream()
                    .map(granted -> granted.getAuthority())
                    .reduce((a, b) -> a + "," + b)
                    .orElse("");

            template.header("X-User-Id", userId);
            template.header("X-User-Roles", roles);
        }
    }
}