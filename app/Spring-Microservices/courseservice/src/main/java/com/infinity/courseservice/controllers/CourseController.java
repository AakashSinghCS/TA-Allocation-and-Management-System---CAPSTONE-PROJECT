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

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseNeedsAndAllocations;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionScheduleDto;
import com.infinity.courseservice.services.CourseService;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Data
@RequestMapping("/courses")
public class CourseController {

    private final CourseService courseService;

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDto> findCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.findCourse(courseId));
    }
    
    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/addCourse")
    public ResponseEntity<CourseDto> addCourse(@RequestBody CourseRequest request) {
        return ResponseEntity.ok( courseService.addCourse(request));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("{courseId}/addSection")
    public ResponseEntity<SectionDto> addSection(@PathVariable Long courseId, @RequestBody CourseRequest request) {      
        return ResponseEntity.ok(courseService.addSection(courseId,request));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/{courseId}/{sectionId}/addSectionSchedule")
    public ResponseEntity<SectionScheduleDto> addSectionSchedule(@PathVariable Long sectionId, @RequestBody CourseRequest request) {
        return ResponseEntity.ok(courseService.addSectionSchedule(sectionId, request));
    }
    
    @PostMapping("/filterCourses")
    public ResponseEntity<List<CourseSectionScheduleDto>> filterCourses(@RequestBody CourseFilterRequest filter) {
        return ResponseEntity.ok(courseService.filterCourses(filter));
    }

    @GetMapping("/allById")
    public ResponseEntity<List<CourseDto>> getCoursesByIds(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(courseService.findCoursesByIds(ids));
    }

    @GetMapping("/sections/get/{id}")
    public ResponseEntity<SectionDto> getSectionById(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getSectionById(id));
    }

    @GetMapping("/needsAndAllocations/{courseId}")
    public ResponseEntity<CourseNeedsAndAllocations> getCourseNeedsAndAllocations(@PathVariable Long courseId) {
        return courseService.getCourseNeedsAndAllocations(courseId);
    }

    // @GetMapping("/getEnrolledCourses/{studentId}")
    // public ResponseEntity<List<CourseDto>> getMethodName(@PathVariable Integer studentId) {
    //     List<CourseDto> courseDtos = courseService.getEnrolledCourses(studentId);
    //     return ResponseEntity.ok(courseDtos);
    // }
    
}
