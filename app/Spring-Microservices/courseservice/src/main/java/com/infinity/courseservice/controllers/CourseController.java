package com.infinity.courseservice.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.courseservice.dtos.CourseDto;
import com.infinity.courseservice.dtos.Response;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.services.CourseService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@Data
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/{id}")
    public ResponseEntity<Response<CourseDto>> findCourse(@PathVariable Long id) {
        CourseDto course = courseService.findCourse(id);
        return ResponseEntity.ok(new Response<>(true, "Course found", course));
    }
    
    @PostMapping("/add")
    public ResponseEntity<Response<CourseDto>> addCourse(@RequestBody Course course) {
        CourseDto courseDto = courseService.addCourse(course);
        return ResponseEntity.ok(new Response<>(true, "Course found", courseDto));
    }
}
