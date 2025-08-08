package com.infinity.userservice;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.userservice.dtos.AuditEventDto;
import com.infinity.userservice.enums.ActionOptions;
import com.infinity.userservice.exceptions.NotFoundException;
import com.infinity.userservice.models.AuditEvent;
import com.infinity.userservice.models.User;
import com.infinity.userservice.repositories.AuditRepository;
import com.infinity.userservice.repositories.UserRepository;
import com.infinity.userservice.services.AuditService;
import com.infinity.userservice.utility.AuditMapper;

@ExtendWith(MockitoExtension.class)
class AuditServiceTest {

    @Mock
    private AuditRepository auditRepo;
    @Mock
    private AuditMapper auditMapper;
    @Mock
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private AuditService service;

    @BeforeEach
    void setUp() {
        service = new AuditService(auditRepo, objectMapper, auditMapper, userRepository);
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
        DummyUser after = null;

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
                .id(42L)
                .actorId(5L)
                .entityId(2L)
                .entityType("User")
                .action(ActionOptions.UPDATE)
                .service("user-service")
                .timestamp(LocalDateTime.now())
                .build();

        AuditEventDto auditDto = new AuditEventDto(
                42L,
                5L,
                "Actor Name",
                LocalDateTime.now(),
                "user-service",
                ActionOptions.UPDATE,
                "E",
                2L,
                "Entity Name",
                null, null);

        when(auditRepo.findById(42L)).thenReturn(Optional.of(expected));
        when(userRepository.findById(5L)).thenReturn(
                Optional.of(new User("actor@example.com", "Actor", "Name", "pass")));
        when(userRepository.findById(2L)).thenReturn(
                Optional.of(new User("entity@example.com", "Entity", "Name", "pass")));

        when(auditMapper.mapToDto(expected, "Actor Name", "Entity Name")).thenReturn(auditDto);

        AuditEventDto actual = service.getById(42L);
        assertThat(actual).isSameAs(auditDto);

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
        when(auditRepo.findAll(any(Specification.class), eq(pageReq)))
                .thenReturn(Page.empty(pageReq));

        service.search(
                pageReq,
                "svc", // service filter
                "entity", // entityType filter
                555L, // entityId filter
                ActionOptions.DELETE,
                777L,
                "2025-07-16" // dateOnly filter
        );

        // verify it called findAll with a Specification and the same Pageable
        verify(auditRepo).findAll(
                (Specification<AuditEvent>) any(Specification.class),
                eq(pageReq));
    }

    @Test
    void search_mapsEventsToDtos() {
        Pageable pageReq = PageRequest.of(0, 10);

        AuditEvent event = AuditEvent.builder()
                .id(1L)
                .actorId(10L)
                .entityId(20L)
                .service("user-service")
                .action(ActionOptions.UPDATE)
                .entityType("User")
                .timestamp(LocalDateTime.now())
                .build();

        Page<AuditEvent> eventPage = new PageImpl<>(List.of(event), pageReq, 1);

        when(auditRepo.findAll(any(Specification.class), eq(pageReq))).thenReturn(eventPage);

        when(userRepository.findById(10L))
                .thenReturn(Optional.of(new User("actor@example.com", "Alice", "Smith", "pw")));
        when(userRepository.findById(20L))
                .thenReturn(Optional.of(new User("entity@example.com", "Bob", "Johnson", "pw")));

        AuditEventDto expectedDto = new AuditEventDto(
                1L, 10L, "Alice Smith", event.getTimestamp(),
                "user-service", ActionOptions.UPDATE, "User", 20L, "Bob Johnson",
                null, null);

        when(auditMapper.mapToDto(event, "Alice Smith", "Bob Johnson")).thenReturn(expectedDto);

        Page<AuditEventDto> result = service.search(
                pageReq,
                "user-service",
                "User",
                20L,
                ActionOptions.UPDATE,
                10L,
                null);
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0)).isEqualTo(expectedDto);
    }

}
