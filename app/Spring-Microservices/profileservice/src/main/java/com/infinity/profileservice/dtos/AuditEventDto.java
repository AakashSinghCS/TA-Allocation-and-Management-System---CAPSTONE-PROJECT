package com.infinity.profileservice.dtos;

import java.time.LocalDateTime;

import com.infinity.profileservice.enums.ActionOptions;

import io.micrometer.common.lang.Nullable;

public record AuditEventDto(
        Long id,
        Long actorId,
        String actorName,
        LocalDateTime timestamp,
        String service,
        ActionOptions action,
        String entityType,
        Long entityId,
        @Nullable String entityName,
        String beforeJson,
        String afterJson) {
}
