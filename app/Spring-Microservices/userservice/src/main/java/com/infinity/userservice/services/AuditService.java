package com.infinity.userservice.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.AuditEvent;
import com.infinity.userservice.repositories.AuditEventRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditEventRepository auditRepo;
    private final ObjectMapper objectMapper;

    private static final String SERVICE_NAME = "user-service";

    public void record(
        Long actorId,
        String action,
        String entityType,
        Object before,
        Object after,
        Long entityId
    ) {
        try {
            String beforeJson = before == null ? null : objectMapper.writeValueAsString(before);
            String afterJson  = after  == null ? null : objectMapper.writeValueAsString(after);
            AuditEvent ev = AuditEvent.builder()
                .actorId(actorId)
                .service(SERVICE_NAME)
                .action(action)
                .entityType(entityType)
                .entityId(entityId == null ? null : entityId.toString())
                .beforeJson(beforeJson)
                .afterJson(afterJson)
                .timestamp(LocalDateTime.now()) // also set by @CreatedDate
                .build();
            auditRepo.save(ev);
        } catch (JsonProcessingException e) {
            // log or rethrow as needed
        }
    }

    public Page<AuditEvent> search(Pageable pageable, String service, String entityType) {
        if (service != null) {
            return auditRepo.findByServiceIgnoreCase(service, pageable);
        }
        if (entityType != null) {
            return auditRepo.findByEntityTypeIgnoreCase(entityType, pageable);
        }
        return auditRepo.findAll(pageable);
    }

    /**
     * Lookup a single AuditEvent by its id, or throw 404
     */
    public AuditEvent getById(Long id) {
        return auditRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("AuditEvent not found with id " + id));
    }
}
