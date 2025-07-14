package com.infinity.userservice.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import com.infinity.userservice.models.AuditEvent;
import com.infinity.userservice.repositories.AuditEventRepository;

@RestController
@RequestMapping("/users/audit")
@RequiredArgsConstructor
public class AuditEventController {

    private final AuditEventRepository repo;

    @GetMapping
    public Page<AuditEvent> search(
        Pageable pageable,
        @RequestParam(required = false) String service,
        @RequestParam(required = false) String entityType
    ) {
        if (service != null) {
            return repo.findByServiceIgnoreCase(service, pageable);
        }
        if (entityType != null) {
            return repo.findByEntityTypeIgnoreCase(entityType, pageable);
        }
        return repo.findAll(pageable);
    }
}
