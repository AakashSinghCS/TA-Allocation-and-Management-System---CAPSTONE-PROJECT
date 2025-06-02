package com.infinity.courseservice.feign;

import org.springframework.cloud.openfeign.FeignClient;

@FeignClient("USER-SERVICE")
public interface UserInterface {

}
