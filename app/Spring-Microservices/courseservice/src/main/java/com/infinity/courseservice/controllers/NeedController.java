package com.infinity.courseservice.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.courseservice.dtos.NeedDto;
import com.infinity.courseservice.services.NeedService;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/needs")
public class NeedController {

    private final NeedService needService;

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping("/add/{courseId}")
    public ResponseEntity<NeedDto> addNeed(@RequestBody NeedDto request,
            @PathVariable Long courseId) {
        return ResponseEntity.ok(needService.addNeed(request, courseId));
    }
    
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PutMapping("/add")
    public ResponseEntity<NeedDto> updateNeed(@RequestBody NeedDto request,
            @RequestHeader("X-User-Id") Long requesterId,
            @RequestHeader("X-User-Roles") List<String> roles) {

        return ResponseEntity.ok(needService.updateNeed(request, requesterId, roles));
    }
    
}
