package com.infinity.applicationservice.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.applicationservice.dtos.ApplicationDto;
import com.infinity.applicationservice.dtos.ApplicationRequest;
import com.infinity.applicationservice.services.ApplicationService;

import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Data
@RequestMapping("/applications")
public class ApplicationController {

    private ApplicationService applicationService;

    @PostMapping("/add")
    public ResponseEntity<ApplicationDto> apply(@RequestBody @Valid ApplicationRequest req,
            @RequestHeader("X-User-Id") Long requesterId,
    @RequestHeader("X-User-Roles") List<String> roles) {
        return ResponseEntity.ok(applicationService.apply(req, requesterId, roles));
    }
    
}
