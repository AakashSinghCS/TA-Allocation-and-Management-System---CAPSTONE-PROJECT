package com.infinity.applicationservice.services;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.infinity.applicationservice.dtos.Audit.AuditEventDto;
import com.infinity.applicationservice.dtos.Users.UserDto;
import com.infinity.applicationservice.enums.ActionOptions;
import com.infinity.applicationservice.exceptions.NotFoundException;
import com.infinity.applicationservice.feign.UserInterface;
import com.infinity.applicationservice.models.AuditEvent;
import com.infinity.applicationservice.repositories.AuditRepository;
import com.infinity.applicationservice.utility.AuditMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditRepository auditRepo;
    private final ObjectMapper objectMapper;
    private final AuditMapper auditMapper;
    // private final UserRepository userRepository;
    private final UserInterface userInterface;
    // private final ApplicationRe

    private static final String SERVICE_NAME = "application-service";

    public void record(
            Long actorId,
            ActionOptions action,
            String entityType,
            Object before,
            Object after,
            Long entityId) {
        try {
            String beforeJson = before == null ? null
                    : objectMapper.writeValueAsString(before);
            String afterJson = after == null ? null
                    : objectMapper.writeValueAsString(after);
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
            System.out.println(e);
            // log or rethrow as needed
        }
    }

    public Page<AuditEventDto> search(
            Pageable pageable,
            String service,
            String entityType,
            Long entityId,
            ActionOptions action,
            Long actorId,
            String dateOnly) {

        Specification<AuditEvent> spec = (root, query, cb) -> cb.conjunction();

        if (service != null) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("service")), service.toLowerCase()));
        }

        if (entityType != null) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("entityType")), entityType.toUpperCase()));
        }

        if (entityId != null) {
            // stored as String in the DB
            spec = spec.and((root, query, cb) -> cb.equal(root.get("entityId"), entityId));
        }

        if (action != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("action"), action));
        }

        if (actorId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("actorId"), actorId));
        }

        if (dateOnly != null) {
            // parse the YYYY-MM-DD date and build the day’s bounds
            LocalDate day = LocalDate.parse(dateOnly);
            LocalDateTime startOfDay = day.atStartOfDay();
            LocalDateTime startOfNext = startOfDay.plusDays(1);

            spec = spec.and((root, query, cb) -> cb.between(root.get("timestamp"), startOfDay, startOfNext));
        }
        Page<AuditEvent> page = auditRepo.findAll(spec, pageable);

        return page.map(event -> {
            ResponseEntity<UserDto> resp = userInterface.getUserDetailsById(event.getActorId());
            UserDto user = resp.getBody();
            String actorName = (user != null)
                ? user.firstName() + " " + user.lastName()
                : "Unknown";

            return auditMapper.mapToDto(event, actorName,null);
        });

    }

    public AuditEventDto getById(Long id) {
        AuditEvent event = auditRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("AuditEvent not found with id " + id));
        ResponseEntity<UserDto> resp = userInterface.getUserDetailsById(event.getActorId());
            UserDto user = resp.getBody();
            String actorName = (user != null)
                ? user.firstName() + " " + user.lastName()
                : "Unknown";

        return auditMapper.mapToDto(event, actorName, null);
    }
}
