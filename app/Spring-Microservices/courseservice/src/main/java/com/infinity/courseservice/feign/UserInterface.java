package com.infinity.courseservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.infinity.courseservice.dtos.UserDtos.InstructorDto;
import com.infinity.courseservice.dtos.UserDtos.UserDto;

@FeignClient("USER-SERVICE")
public interface UserInterface {

    @GetMapping("/students/{studentId}")
    UserDto getStudentById(@PathVariable("studentId") Integer studentId);

    @GetMapping("/instructors/{instructorId}")
    InstructorDto getInstructorById(@PathVariable Long instructorId);

}
