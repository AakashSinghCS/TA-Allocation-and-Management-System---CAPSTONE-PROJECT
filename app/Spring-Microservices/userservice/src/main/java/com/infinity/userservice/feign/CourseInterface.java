package com.infinity.userservice.feign;

import org.springframework.cloud.openfeign.FeignClient;

import com.infinity.userservice.config.FeignClientInterceptor;

@FeignClient(name="COURSE-SERVICE", configuration = FeignClientInterceptor.class)
public interface CourseInterface {

}
