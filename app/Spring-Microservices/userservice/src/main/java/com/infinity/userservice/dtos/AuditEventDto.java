package com.infinity.userservice.dtos;

import java.time.LocalDateTime;

import com.infinity.userservice.enums.ActionOptions;

public record AuditEventDto(
        Long id,
        Long actorId,
        String actorName,
        LocalDateTime timestamp,
        String service,
        ActionOptions action,
        String entityType,
        Long entityId,
        String entityName,
        String beforeJson,
        String afterJson) {
}
