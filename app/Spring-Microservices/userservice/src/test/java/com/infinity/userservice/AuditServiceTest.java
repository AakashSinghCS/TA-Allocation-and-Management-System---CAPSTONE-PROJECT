package com.infinity.userservice;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.userservice.enums.ActionOptions;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.AuditEvent;
import com.infinity.userservice.repositories.AuditRepository;
import com.infinity.userservice.services.AuditService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditServiceTest {

    @Mock
    private AuditRepository auditRepo;

    // use a real ObjectMapper so filterPassword actually runs
    private ObjectMapper objectMapper = new ObjectMapper();

    private AuditService service;

    @BeforeEach
    void setUp() {
        service = new AuditService(auditRepo, objectMapper);
    }

    // helper dummy class to test password filtering
    static class DummyUser {
        public String username;
        public String password;

        DummyUser(String u, String p) {
            username = u;
            password = p;
        }
    }

    @Test
    void record_filtersOutPasswordField_andHandlesNulls() throws JsonProcessingException {
        DummyUser before = new DummyUser("alice", "secret");
        DummyUser after  = null;

        service.record(99L, ActionOptions.CREATE, "MyEntity", before, after, 123L);

        ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditRepo).save(captor.capture());

        AuditEvent ev = captor.getValue();
        // actorId, service, action, entityType, entityId are set
        assertThat(ev.getActorId()).isEqualTo(99L);
        assertThat(ev.getService()).isEqualTo("user-service");
        assertThat(ev.getAction()).isEqualTo(ActionOptions.CREATE);
        assertThat(ev.getEntityType()).isEqualTo("MyEntity");
        assertThat(ev.getEntityId()).isEqualTo(123L);

        // beforeJson should include username but not password
        String beforeJson = ev.getBeforeJson();
        assertThat(beforeJson).contains("alice");
        assertThat(beforeJson).doesNotContain("secret");
        // afterJson should be null
        assertThat(ev.getAfterJson()).isNull();
        // timestamp should be non-null
        assertThat(ev.getTimestamp()).isBeforeOrEqualTo(LocalDateTime.now());
    }

    @Test
    void getById_returnsEventWhenFound() {
        AuditEvent expected = AuditEvent.builder()
            .actorId(5L)
            .entityType("E")
            .action(ActionOptions.UPDATE)
            .service("user-service")
            .id(42L)
            .timestamp(LocalDateTime.now())
            .build();

        when(auditRepo.findById(42L)).thenReturn(Optional.of(expected));

        AuditEvent actual = service.getById(42L);
        assertThat(actual).isSameAs(expected);
    }

    @Test
    void getById_throwsNotFound_whenMissing() {
        when(auditRepo.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getById(99L))
            .isInstanceOf(NotFoundException.class)
            .hasMessageContaining("AuditEvent not found with id 99");
    }

    @Test
    void search_delegatesToRepositoryWithSpecificationAndPageable() {
        Pageable pageReq = PageRequest.of(1, 20);
        // no need to stub the return; we just verify interaction
        service.search(
            pageReq,
            "svc",         // service filter
            "entity",      // entityType filter
            555L,          // entityId filter
            ActionOptions.DELETE,
            777L,
            "2025-07-16"   // dateOnly filter
        );

        // verify it called findAll with a Specification and the same Pageable
        verify(auditRepo).findAll(
            (Specification<AuditEvent>) any(Specification.class),
            eq(pageReq)
        );
    }
}
