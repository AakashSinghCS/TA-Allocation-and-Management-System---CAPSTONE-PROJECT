package com.infinity.applicationservice.controllers;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.applicationservice.dtos.DeadlineDto;
import com.infinity.applicationservice.models.GlobalDeadline;
import com.infinity.applicationservice.services.ConfigService;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/config")
public class ConfigController {

    private final ConfigService configService;

    // Get all deadlines
    @GetMapping
    public List<GlobalDeadline> getDeadlines() {
        return configService.getDeadlines();
    }

    @GetMapping("{name}")
    public GlobalDeadline getDeadlineByName(@PathVariable String name) {
        return configService.getDeadlineByName(name);
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/add")
    public List<GlobalDeadline> addDeadlines(@RequestBody List<DeadlineDto> dto) {
        return configService.addDeadlines(dto);
    }

    // Update a deadline by name
    @PreAuthorize("hasRole('COORDINATOR')")
    @PutMapping("/update/{name}")
    public GlobalDeadline updateDeadline(
            @PathVariable String name,
            @RequestBody DeadlineDto deadline
    ) {
        return configService.updateDeadline(name, deadline);
    }
}
