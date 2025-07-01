package com.infinity.courseservice.controllers;

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

import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedRequest;
import com.infinity.courseservice.services.NeedService;

import lombok.RequiredArgsConstructor;



@RestController
@RequiredArgsConstructor
@RequestMapping("/needs")
public class NeedController {

    private final NeedService needService;

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/add/{courseId}")
    public ResponseEntity<NeedDto> addNeed(@RequestBody NeedRequest request,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(needService.addNeed(request, courseId));
    }

    @GetMapping("/get/{courseId}/{year}/{semester}")
    public ResponseEntity<NeedDto> getNeed(@PathVariable Long courseId,
            @PathVariable Integer year, @PathVariable String semester) {
        return ResponseEntity.ok(needService.getNeed(courseId, year, semester));
    }
    
    
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PutMapping("/update/{courseId}/{year}/{semester}")
    public ResponseEntity<NeedDto> updateNeed(@RequestBody NeedRequest request,
            @PathVariable Long courseId, @PathVariable Integer year, @PathVariable String semester) {
        return ResponseEntity.ok(needService.updateNeed(request, courseId, year, semester));
    }
    
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @DeleteMapping("/delete/{courseId}/{year}/{semester}")
    public ResponseEntity<String> deleteNeed(@PathVariable Long courseId,
            @PathVariable Integer year, @PathVariable String semester) {
        return ResponseEntity.ok(needService.deleteNeed(courseId, year, semester));
    }
}
