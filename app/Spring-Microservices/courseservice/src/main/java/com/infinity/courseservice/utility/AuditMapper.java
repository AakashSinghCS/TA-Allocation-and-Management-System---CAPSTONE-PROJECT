package com.infinity.courseservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.courseservice.dtos.AuditDtos.AuditEventDto;
import com.infinity.courseservice.models.AuditEvent;

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
