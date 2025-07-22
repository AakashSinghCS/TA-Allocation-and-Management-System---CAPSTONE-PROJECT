package com.infinity.userservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.userservice.dtos.AuditEventDto;
import com.infinity.userservice.models.AuditEvent;

@Component
public class AuditMapper { 

    public AuditEventDto mapToDto(AuditEvent event, String actorName, String entityName) {
        return new AuditEventDto(
                event.getId(),
                event.getActorId(),
                actorName,
                event.getTimestamp(),
                event.getService(),
                event.getAction(),
                event.getEntityType(),
                event.getEntityId(),
                entityName,
                event.getBeforeJson(),
                event.getAfterJson());
    }
}
