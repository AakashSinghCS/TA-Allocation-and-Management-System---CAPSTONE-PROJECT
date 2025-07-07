package com.infinity.courseservice.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.SectionDtos.AssignInstructorRequest;
import com.infinity.courseservice.dtos.SectionDtos.SectionAddDtoRequest;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoWithInstructorId;
import com.infinity.courseservice.dtos.SectionDtos.SectionScheduleDto;
import com.infinity.courseservice.services.SectionService;

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

     @GetMapping("/getIncludeInstructorId/{id}")
     public ResponseEntity<SectionDtoWithInstructorId> getSectionWithInstructorIdById(@PathVariable Long id) {
         return ResponseEntity.ok(sectionService.getSectionWithInstructorIdById(id));
     }
    
     @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/addSection/{courseId}")
     public ResponseEntity<SectionDto> addSection(@PathVariable Long courseId, @RequestBody SectionAddDtoRequest request) {
         return ResponseEntity.ok(sectionService.addSection(courseId, request));
     }
    
     @PreAuthorize("hasRole('COORDINATOR')")
     @PutMapping("/updateSection/{sectionId}")
     public ResponseEntity<SectionDto> updateSection(@PathVariable Long sectionId, @RequestBody CourseRequest request) {
         return ResponseEntity.ok(sectionService.updateSection(sectionId, request));
     }

     @PreAuthorize("hasRole('COORDINATOR')")
     @DeleteMapping("/deleteSection/{sectionId}")
     public ResponseEntity<String> deleteSection(@PathVariable Long sectionId) {
         return ResponseEntity.ok(sectionService.deleteSection(sectionId));
     }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/addSectionSchedule/{sectionId}")
    public ResponseEntity<SectionScheduleDto> addSectionSchedule(@PathVariable Long sectionId,
            @RequestBody CourseRequest request) {
        return ResponseEntity.ok(sectionService.addSectionSchedule(sectionId, request));
    }

    @GetMapping("getSectionSchedules/{sectionId}")
    public ResponseEntity<List<SectionScheduleDto>> getSectionSchedules(@PathVariable Long sectionId) {
        return ResponseEntity.ok(sectionService.getSectionSchedules(sectionId));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PutMapping("/updateSectionSchedule/{sectionScheduleId}")
    public ResponseEntity<SectionScheduleDto> updateSectionSchedule(@PathVariable Long sectionScheduleId,
            @RequestBody CourseRequest request) {
        return ResponseEntity.ok(sectionService.updateSectionSchedule(sectionScheduleId, request));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @DeleteMapping("deleteSectionSchedule/{sectionScheduleId}")
    public ResponseEntity<String> deleteSectionSchedule(@PathVariable Long sectionScheduleId) {
        return ResponseEntity.ok(sectionService.deleteSectionSchedule(sectionScheduleId));
    }

    @PreAuthorize("hasAnyRole('COORDINATOR','INSTRUCTOR')")
    @PostMapping("/assignInstructor")
    public ResponseEntity<String> assignInstructor(@RequestBody AssignInstructorRequest request) {
        return ResponseEntity.ok(sectionService.assignInstructor(request));
    }

    @PreAuthorize("hasAnyRole('COORDINATOR','INSTRUCTOR')")
    @DeleteMapping("/unassignInstructor/{sectionId}/{instructorId}")
    public ResponseEntity<String> unassignInstructor(@PathVariable Long sectionId,
            @PathVariable Long instructorId) {
        return ResponseEntity.ok(sectionService.unassignInstructor(sectionId, instructorId));
    }

    @PreAuthorize("hasAnyRole('COORDINATOR','INSTRUCTOR')")
    @GetMapping("/getInstructorSections/{instructorId}")
    public ResponseEntity<List<SectionDto>> getInstructorSections(@PathVariable Long instructorId) {
        return ResponseEntity.ok(sectionService.getInstructorSections(instructorId));
    }

     @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/add")
    public ResponseEntity<Boolean> add( @RequestBody SectionAddDtoRequest request) {      
        return ResponseEntity.ok(sectionService.add(request));
    }

    @GetMapping("/getByCourseIdSectionYearSemester/{courseId}/{section}/{year}/{semester}")
    public ResponseEntity<SectionDto> getByCourseIdSectionYearSemester(
            @PathVariable Long courseId,
            @PathVariable String section,
            @PathVariable Integer year,
            @PathVariable String semester) {

        SectionDto sectionDto = sectionService.getByCourseIdSectionYearSemester(courseId, section, year, semester);
        return ResponseEntity.ok(sectionDto);
    }

}
