package com.infinity.applicationservice.controllers;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.infinity.applicationservice.dtos.Audit.AuditEventDto;
import com.infinity.applicationservice.enums.ActionOptions;
import com.infinity.applicationservice.services.AuditService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/applications/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @PreAuthorize("hasRole('ADMIN')")
     @GetMapping
    public Page<AuditEventDto> search(
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
    public AuditEventDto getById(@PathVariable Long id) {
        return auditService.getById(id);
    }
}
