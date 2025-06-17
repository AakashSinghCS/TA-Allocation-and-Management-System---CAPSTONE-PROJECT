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
import com.infinity.courseservice.dtos.CourseSectionScheduleDto;
import com.infinity.courseservice.dtos.SectionDto;
import com.infinity.courseservice.dtos.SectionScheduleDto;
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
        CourseDto courseDto = courseService.findCourse(courseId);
        return ResponseEntity.ok(courseDto);
    }
    
    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/addCourse")
    public ResponseEntity<CourseDto> addCourse(@RequestBody CourseRequest request) {
        CourseDto courseDto = courseService.addCourse(request);
        return ResponseEntity.ok(courseDto);
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("{courseId}/addSection")
    public ResponseEntity<SectionDto> addSection(@PathVariable Long courseId, @RequestBody CourseRequest request) {       
        SectionDto sectionDto = courseService.addSection(courseId,request);
        return ResponseEntity.ok(sectionDto);
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/{courseId}/{sectionId}/addSectionSchedule")
    public ResponseEntity<SectionScheduleDto> addSectionSchedule(@PathVariable Long sectionId, @RequestBody CourseRequest request) {
        SectionScheduleDto courseScheduleDto = courseService.addSectionSchedule(sectionId, request);
        return ResponseEntity.ok(courseScheduleDto);
    }
    
    @PostMapping("/filterCourses")
    public ResponseEntity<List<CourseSectionScheduleDto>> filterCourses(@RequestBody CourseFilterRequest filter) {
        List<CourseSectionScheduleDto> CourseSectionScheduleDto = courseService.filterCourses(filter);
        return ResponseEntity.ok(CourseSectionScheduleDto);
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
