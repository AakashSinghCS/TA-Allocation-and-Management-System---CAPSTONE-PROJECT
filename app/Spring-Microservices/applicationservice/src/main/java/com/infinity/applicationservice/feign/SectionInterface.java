package com.infinity.applicationservice.feign;

import com.infinity.applicationservice.dtos.SectionDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "COURSE-SERVICE", path = "/courses/sections")
public interface SectionInterface {
    @GetMapping("/get/{id}")
    SectionDto getSectionById(@PathVariable("id") Long id);
}
