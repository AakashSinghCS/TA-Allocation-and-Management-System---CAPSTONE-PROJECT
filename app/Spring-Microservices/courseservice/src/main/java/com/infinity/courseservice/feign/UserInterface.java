package com.infinity.courseservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.infinity.courseservice.config.FeignClientInterceptor;
import com.infinity.courseservice.dtos.UserDtos.UserDto;

@FeignClient(name="USER-SERVICE", configuration = FeignClientInterceptor.class)
public interface UserInterface {

    @GetMapping("/users/students/{studentId}")
    UserDto getStudentById(@PathVariable Long studentId);


    @GetMapping("/users/instructors/{instructorId}")
    UserDto getInstructorById(@PathVariable Long instructorId);

}
