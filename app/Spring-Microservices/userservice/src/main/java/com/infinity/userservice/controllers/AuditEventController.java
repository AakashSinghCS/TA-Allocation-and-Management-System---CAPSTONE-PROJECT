package com.infinity.userservice.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.infinity.userservice.enums.ActionOptions;
import com.infinity.userservice.models.AuditEvent;
import com.infinity.userservice.repositories.AuditEventRepository;
import com.infinity.userservice.services.AuditService;

@RestController
@RequestMapping("/users/audit")
@RequiredArgsConstructor
public class AuditEventController {

    private final AuditService auditService;

    @PreAuthorize("hasRole('ADMIN')")
     @GetMapping
    public Page<AuditEvent> search(
        Pageable pageable,
        @RequestParam(required = false) String service,
        @RequestParam(required = false) String entityType,
        @RequestParam(required = false) Long entityId,
        @RequestParam(required = false) ActionOptions action,
        @RequestParam(required = false) Long actorId,
        @RequestParam(required = false) String dateOnly

    ) {
        return auditService.search(pageable, service, entityType,entityId,action,actorId,dateOnly);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public AuditEvent getById(@PathVariable Long id) {
        return auditService.getById(id);
    }
}
