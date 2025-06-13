package com.infinity.courseservice.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.courseservice.dtos.CourseDto;
import com.infinity.courseservice.dtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseSectionDto;
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
    
    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/add")
    public ResponseEntity<CourseDto> addCourse(@RequestBody CourseRequest request) {
        CourseDto courseDto = courseService.addCourse(request);
        return ResponseEntity.ok(courseDto);
    }
    
    /* 
    @GetMapping("/filterCourses")
    */
    @PostMapping("/filterCourses") // Changed to @PostMapping
    public ResponseEntity<List<CourseSectionDto>> filterCourses(@RequestBody CourseFilterRequest filter) {
        List<CourseSectionDto> CourseSectionDto = courseService.filterCourses(filter);
        return ResponseEntity.ok(CourseSectionDto);
    }

    @GetMapping("/allById")
    public ResponseEntity<List<CourseDto>> getCoursesByIds(@RequestParam List<Long> ids) {
        List<CourseDto> courseDtos = courseService.findCoursesByIds(ids);
        return ResponseEntity.ok(courseDtos);
    }

    // @GetMapping("/getEnrolledCourses/{studentId}")
    // public ResponseEntity<List<CourseDto>> getMethodName(@PathVariable Integer studentId) {
    //     List<CourseDto> courseDtos = courseService.getEnrolledCourses(studentId);
    //     return ResponseEntity.ok(courseDtos);
    // }
    
}
