package com.infinity.courseservice.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.SectionDtos.AssignInstructorRequest;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionScheduleDto;
import com.infinity.courseservice.services.SectionService;

import feign.Response;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sections")
public class SectionController {

    private final SectionService sectionService;

     @GetMapping("/get/{id}")
     public ResponseEntity<SectionDto> getSectionById(@PathVariable Long id) {
         return ResponseEntity.ok(sectionService.getSectionById(id));
     }
    
     @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/addSection/{courseId}")
    public ResponseEntity<SectionDto> addSection(@PathVariable Long courseId, @RequestBody CourseRequest request) {      
        return ResponseEntity.ok(sectionService.addSection(courseId,request));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/addSectionSchedule/{sectionId}")
    public ResponseEntity<SectionScheduleDto> addSectionSchedule(@PathVariable Long sectionId,
            @RequestBody CourseRequest request) {
        return ResponseEntity.ok(sectionService.addSectionSchedule(sectionId, request));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/assignInstructor")
    public ResponseEntity<String> assignInstructor(@RequestBody AssignInstructorRequest request) {
        return ResponseEntity.ok(sectionService.assignInstructor(request));
    }
}
