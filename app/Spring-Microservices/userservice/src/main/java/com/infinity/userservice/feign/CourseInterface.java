package com.infinity.userservice.feign;

import org.springframework.cloud.openfeign.FeignClient;

@FeignClient("COURSE-SERVICE")
public interface CourseInterface {

}
