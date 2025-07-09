package com.infinity.courseservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.infinity.courseservice.dtos.UserDtos.UserDto;

@FeignClient("USER-SERVICE")
public interface UserInterface {

    @GetMapping("/users/students/{studentId}")
    UserDto getStudentById(@PathVariable Long studentId);


    @GetMapping("/users/instructors/{instructorId}")
    UserDto getInstructorById(@PathVariable Long instructorId);

}
