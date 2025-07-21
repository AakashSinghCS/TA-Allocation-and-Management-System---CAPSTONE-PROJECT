package com.infinity.userservice;

import com.infinity.userservice.dtos.AuditEventDto;
import com.infinity.userservice.enums.ActionOptions;
import com.infinity.userservice.models.AuditEvent;
import com.infinity.userservice.utility.AuditMapper;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

class AuditMapperTest {

    private final AuditMapper mapper = new AuditMapper();

    @Test
    void mapToDto_mapsFieldsCorrectly() {
        AuditEvent event = AuditEvent.builder()
                .id(1L)
                .actorId(99L)
                .timestamp(LocalDateTime.of(2025, 7, 16, 12, 0))
                .service("user-service")
                .action(ActionOptions.UPDATE)
                .entityType("User")
                .entityId(123L)
                .beforeJson("{\"before\":\"foo\"}")
                .afterJson("{\"after\":\"bar\"}")
                .build();

        String actorName = "Alice Smith";
        String entityName = "Bob Johnson";

        AuditEventDto dto = mapper.mapToDto(event, actorName, entityName);

        assertThat(dto.id()).isEqualTo(1L);
        assertThat(dto.actorId()).isEqualTo(99L);
        assertThat(dto.actorName()).isEqualTo("Alice Smith");
        assertThat(dto.timestamp()).isEqualTo(LocalDateTime.of(2025, 7, 16, 12, 0));
        assertThat(dto.service()).isEqualTo("user-service");
        assertThat(dto.action()).isEqualTo(ActionOptions.UPDATE);
        assertThat(dto.entityType()).isEqualTo("User");
        assertThat(dto.entityId()).isEqualTo(123L);
        assertThat(dto.entityName()).isEqualTo("Bob Johnson");
        assertThat(dto.beforeJson()).isEqualTo("{\"before\":\"foo\"}");
        assertThat(dto.afterJson()).isEqualTo("{\"after\":\"bar\"}");
    }

    @Test
    void mapToDto_allowsNullJson() {
        AuditEvent event = AuditEvent.builder()
                .id(2L)
                .actorId(88L)
                .timestamp(LocalDateTime.now())
                .service("notification-service")
                .action(ActionOptions.CREATE)
                .entityType("User")
                .entityId(222L)
                .beforeJson(null)
                .afterJson(null)
                .build();

        AuditEventDto dto = mapper.mapToDto(event, "Actor", "Entity");

        assertThat(dto.beforeJson()).isNull();
        assertThat(dto.afterJson()).isNull();
    }
}
