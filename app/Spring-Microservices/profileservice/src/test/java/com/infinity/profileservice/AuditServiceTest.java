package com.infinity.profileservice;


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
import org.springframework.http.ResponseEntity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.profileservice.dtos.AuditEventDto;
import com.infinity.profileservice.dtos.UserDto;
import com.infinity.profileservice.enums.ActionOptions;
import com.infinity.profileservice.exceptions.NotFoundException;
import com.infinity.profileservice.feign.UserInterface;
import com.infinity.profileservice.models.AuditEvent;
import com.infinity.profileservice.repositories.AuditRepository;
import com.infinity.profileservice.services.AuditService;
import com.infinity.profileservice.utility.AuditMapper;

@ExtendWith(MockitoExtension.class)
class AuditServiceTest {

    @Mock
    private AuditRepository auditRepo;
    @Mock
    private AuditMapper auditMapper;
    @Mock
    private UserInterface userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private AuditService service;

    @BeforeEach
    void setUp() {
        service = new AuditService(auditRepo, objectMapper, auditMapper, userRepository);
    }

    static class DummyUser {
        public String username;
        public String password;

        DummyUser(String u, String p) {
            username = u;
            password = p;
        }
    }

    @Test
    void record_andHandlesNulls() throws JsonProcessingException {
        DummyUser before = new DummyUser("alice", "secret");
        Object after = null;

        service.record(
                99L,
                ActionOptions.CREATE,
                "MyEntity",
                before,
                after,
                123L);

        ArgumentCaptor<AuditEvent> captor = ArgumentCaptor.forClass(AuditEvent.class);
        verify(auditRepo).save(captor.capture());

        AuditEvent ev = captor.getValue();
        assertThat(ev.getActorId()).isEqualTo(99L);
        assertThat(ev.getService()).isEqualTo("profile-service");
        assertThat(ev.getAction()).isEqualTo(ActionOptions.CREATE);
        assertThat(ev.getEntityType()).isEqualTo("MyEntity");
        assertThat(ev.getEntityId()).isEqualTo(123L);

        String beforeJson = ev.getBeforeJson();
        assertThat(beforeJson).contains("alice");
        assertThat(beforeJson).contains("secret");
        assertThat(ev.getAfterJson()).isNull();
        assertThat(ev.getTimestamp()).isBeforeOrEqualTo(LocalDateTime.now());
    }

    @Test
    void getById_returnsEventWhenFound() {
        AuditEvent expected = AuditEvent.builder()
                .id(42L)
                .actorId(5L)
                .entityId(2L)
                .entityType("Profile")
                .action(ActionOptions.UPDATE)
                .service("profile-service")
                .timestamp(LocalDateTime.now())
                .build();

        AuditEventDto auditDto = new AuditEventDto(
                42L,
                5L,
                "Actor Name",
                LocalDateTime.now(),
                "profile-service",
                ActionOptions.UPDATE,
                "E",
                2L,
                "Entity Name",
                null, null);

        UserDto actorDto = new UserDto(
                5L,
                "Actor",
                "Name",
                "actor@example.com",
                List.of(),
                null,
                null,
                null,
                null,
                null,
                null,
                LocalDateTime.now(),
                true);

        when(auditRepo.findById(42L)).thenReturn(Optional.of(expected));
        when(userRepository.getUserDetailsById(5L)).thenReturn(
                ResponseEntity.ok(actorDto));

        when(auditMapper.mapToDto(expected, "Actor Name", null)).thenReturn(auditDto);

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
                "svc",
                "entity",
                555L,
                ActionOptions.DELETE,
                777L,
                "2025-07-16");

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
                .service("profile-service")
                .action(ActionOptions.UPDATE)
                .entityType("User")
                .timestamp(LocalDateTime.now())
                .build();

        Page<AuditEvent> eventPage = new PageImpl<>(List.of(event), pageReq, 1);

        when(auditRepo.findAll(any(Specification.class), eq(pageReq)))
                .thenReturn(eventPage);

        UserDto actorDto = new UserDto(
                10L, "Alice", "Smith", "alice@example.com",
                List.of(), null, null, null, null, null, null,
                LocalDateTime.now(), true);

        when(userRepository.getUserDetailsById(10L))
                .thenReturn(ResponseEntity.ok(actorDto));
        AuditEventDto expectedDto = new AuditEventDto(
                1L, 10L, "Alice Smith", event.getTimestamp(),
                "profile-service",
                ActionOptions.UPDATE,
                "Profile", 20L, null,
                null, null);
        when(auditMapper.mapToDto(event, "Alice Smith", null))
                .thenReturn(expectedDto);

        Page<AuditEventDto> result = service.search(
                pageReq,
                "profile-service",
                "Profile",
                20L,
                ActionOptions.UPDATE,
                10L,
                null);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0)).isEqualTo(expectedDto);
    }

}
