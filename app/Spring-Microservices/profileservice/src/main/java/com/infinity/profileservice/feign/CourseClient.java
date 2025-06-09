package com.infinity.profileservice.feign;

import java.util.List;
import com.infinity.profileservice.dtos.CourseDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "COURSE-SERVICE")
public interface CourseClient {

    @GetMapping("/courses/getEnrolledCourses/{studentId}")
    List<CourseDto> getEnrolledCourses(@PathVariable Integer studentId);
}
