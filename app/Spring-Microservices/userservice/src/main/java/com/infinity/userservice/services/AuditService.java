package com.infinity.userservice.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.infinity.userservice.enums.ActionOptions;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.AuditEvent;
import com.infinity.userservice.repositories.AuditRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditRepository auditRepo;
    private final ObjectMapper objectMapper;

    private static final String SERVICE_NAME = "user-service";

    public void record(
        Long actorId,
        ActionOptions action,
        String entityType,
        Object before,
        Object after,
        Long entityId
    ) {
        try {
            String beforeJson = before == null ? null : filterPassword(before);
            String afterJson  = after  == null ? null : filterPassword(after);
            AuditEvent ev = AuditEvent.builder()
                .actorId(actorId)
                .service(SERVICE_NAME)
                .action(action)
                .entityType(entityType)
                .entityId(entityId == null ? null : entityId)
                .beforeJson(beforeJson)
                .afterJson(afterJson)
                .timestamp(LocalDateTime.now()) // also set by @CreatedDate
                .build();
            auditRepo.save(ev);
        } catch (JsonProcessingException e) {
            // log or rethrow as needed
        }
    }

    public Page<AuditEvent> search(
        Pageable pageable,
        String   service,
        String   entityType,
        Long     entityId,
        ActionOptions   action,
        Long     actorId,
        String   dateOnly
    ) {
        
        Specification<AuditEvent> spec = (root, query, cb) -> cb.conjunction();

        if (service != null) {
            spec = spec.and((root, query, cb) ->
                cb.equal(cb.lower(root.get("service")), service.toLowerCase()));
        }

        if (entityType != null) {
            spec = spec.and((root, query, cb) ->
                cb.equal(cb.lower(root.get("entityType")), entityType.toUpperCase()));
        }

        if (entityId != null) {
            // stored as String in the DB
            spec = spec.and((root, query, cb) ->
                cb.equal(root.get("entityId"), entityId));
        }

        if (action != null) {
            spec = spec.and((root, query, cb) ->
                cb.equal(root.get("action"), action));
        }

        if (actorId != null) {
            spec = spec.and((root, query, cb) ->
                cb.equal(root.get("actorId"), actorId));
        }

        if (dateOnly != null) {
            // parse the YYYY-MM-DD date and build the day’s bounds
            LocalDate day = LocalDate.parse(dateOnly);
            LocalDateTime startOfDay = day.atStartOfDay();
            LocalDateTime startOfNext = startOfDay.plusDays(1);

            spec = spec.and((root, query, cb) ->
                cb.between(root.get("timestamp"), startOfDay, startOfNext));
        }

        return auditRepo.findAll(spec, pageable);
    }

    /**
     * Lookup a single AuditEvent by its id, or throw 404
     */
    public AuditEvent getById(Long id) {
        return auditRepo.findById(id)
            .orElseThrow(() -> new NotFoundException("AuditEvent not found with id " + id));
    }

    private String filterPassword(Object obj) throws JsonProcessingException {
    if (obj == null) return null;

    // Convert the object into a mutable JSON tree
    JsonNode tree = objectMapper.valueToTree(obj);
    if (tree.isObject()) {
        ((ObjectNode) tree).remove("password");
    }

    // Write back to string
    return objectMapper.writeValueAsString(tree);
}
}
