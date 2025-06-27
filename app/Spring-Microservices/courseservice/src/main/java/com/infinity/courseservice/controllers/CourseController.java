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
import com.infinity.courseservice.dtos.CourseDtos.CourseNeedAndAllocations;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto;
import com.infinity.courseservice.services.CourseService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
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
    
    @PostMapping("/filterCourses")
    public ResponseEntity<List<CourseSectionScheduleDto>> filterCourses(@RequestBody CourseFilterRequest filter) {
        return ResponseEntity.ok(courseService.filterCourses(filter));
    }

    @GetMapping("/allById")
    public ResponseEntity<List<CourseDto>> getCoursesByIds(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(courseService.findCoursesByIds(ids));
    }

    @PreAuthorize("hasAnyRole('COORDINATOR', 'INSTRUCTOR')")
    @GetMapping("/needAndAllocations/{courseId}/{year}/{semester}")
    public ResponseEntity<CourseNeedAndAllocations> getCourseNeedAndAllocations(@PathVariable Long courseId,
            @PathVariable Integer year, @PathVariable String semester) {
        return ResponseEntity.ok(courseService.getCourseNeedAndAllocations(courseId, year, semester));
    }

    @PreAuthorize("hasAnyRole('COORDINATOR', 'INSTRUCTOR')")
    @GetMapping("/needAndAllocations/{instructorId}")
    public ResponseEntity<List<CourseNeedAndAllocations>> getInstructorCourseNeedsAndAllocations(@PathVariable Long instructorId) {
        return ResponseEntity.ok(courseService.getInstructorCourseNeedsAndAllocations(instructorId));
    }

    // @GetMapping("/getEnrolledCourses/{studentId}")
    // public ResponseEntity<List<CourseDto>> getMethodName(@PathVariable Integer studentId) {
    //     List<CourseDto> courseDtos = courseService.getEnrolledCourses(studentId);
    //     return ResponseEntity.ok(courseDtos);
    // }
    
}
