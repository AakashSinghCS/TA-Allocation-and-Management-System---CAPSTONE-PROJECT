package com.infinity.applicationservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.infinity.applicationservice.dtos.Courses.SectionDto;

@FeignClient(name = "COURSE-SERVICE", path = "/sections")
public interface SectionInterface {
    @GetMapping("/get/{id}")
    SectionDto getSectionById(@PathVariable Long id);
}
