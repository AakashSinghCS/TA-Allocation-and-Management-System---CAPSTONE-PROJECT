package com.infinity.courseservice.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.courseservice.dtos.CourseDto;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.services.CourseService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Data
@RequestMapping("/courses")
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/{id}")
    public ResponseEntity<CourseDto> findCourse(@PathVariable Long id) {
        CourseDto courseDto = courseService.findCourse(id);
        return ResponseEntity.ok(courseDto);
    }
    
    @PostMapping("/add")
    public ResponseEntity<CourseDto> addCourse(@RequestBody Course course) {
        CourseDto courseDto = courseService.addCourse(course);
        return ResponseEntity.ok(courseDto);
    }
    
    @GetMapping("/allById")
    public ResponseEntity<List<CourseDto>> getCoursesByIds(@RequestParam List<Long> ids) {
        List<CourseDto> courses = courseService.findCoursesByIds(ids);
        return ResponseEntity.ok(courses);
    }
}
