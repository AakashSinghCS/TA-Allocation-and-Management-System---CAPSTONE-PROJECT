package com.infinity.notificationservice.feign;

import org.springframework.cloud.openfeign.FeignClient;

import com.infinity.notificationservice.config.FeignClientInterceptor;


@FeignClient(name = "USER-SERVICE", configuration = FeignClientInterceptor.class)
public interface UserInterface {

}
