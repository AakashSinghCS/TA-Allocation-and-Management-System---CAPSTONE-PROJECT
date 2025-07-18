package com.infinity.userservice;

import com.infinity.userservice.controllers.AuditController;
import com.infinity.userservice.enums.ActionOptions;
import com.infinity.userservice.models.AuditEvent;
import com.infinity.userservice.services.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.*;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(AuditController.class)
class AuditControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuditService auditService;

    private AuditEvent sampleEvent;

    @BeforeEach
    void setUp() {
        sampleEvent = AuditEvent.builder()
            .id(1L)
            .actorId(99L)
            .service("user-service")
            .action(ActionOptions.CREATE)
            .entityType("MyEntity")
            .entityId(123L)
            .timestamp(LocalDateTime.of(2025,7,16,12,0))
            .beforeJson("{\"foo\":\"bar\"}")
            .afterJson(null)
            .build();
    }

    @WithMockUser(roles = "ADMIN")
    @Test
    void search_returnsPagedAuditEvents() throws Exception {
        // Prepare a page of two copies for example
        List<AuditEvent> list = List.of(sampleEvent, sampleEvent);
        Page<AuditEvent> page = new PageImpl<>(
            list,
            PageRequest.of(0, 2, Sort.by("timestamp").descending()),
            list.size()
        );

        when(auditService.search(
            any(Pageable.class),
            eq("user-service"),
            eq("MyEntity"),
            eq(123L),
            eq(ActionOptions.CREATE),
            eq(99L),
            eq("2025-07-16")
        )).thenReturn(page);

        mockMvc.perform(get("/users/audit")
                .param("page", "0")
                .param("size", "2")
                .param("service", "user-service")
                .param("entityType", "MyEntity")
                .param("entityId", "123")
                .param("action", "CREATE")
                .param("actorId", "99")
                .param("dateOnly", "2025-07-16")
        )
        .andExpect(status().isOk())
        // The JSON structure is a Spring Data Page:
        .andExpect(jsonPath("$.content.length()").value(2))
        .andExpect(jsonPath("$.content[0].id").value(1))
        .andExpect(jsonPath("$.content[0].service").value("user-service"))
        .andExpect(jsonPath("$.totalElements").value(2))
        .andExpect(jsonPath("$.size").value(2))
        .andExpect(jsonPath("$.number").value(0));
    }

    @WithMockUser(roles = "ADMIN")
    @Test
    void getById_returnsSingleAuditEvent() throws Exception {
        when(auditService.getById(1L)).thenReturn(sampleEvent);

        mockMvc.perform(get("/users/audit/{id}", 1L))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.actorId").value(99))
            .andExpect(jsonPath("$.service").value("user-service"))
            .andExpect(jsonPath("$.action").value("CREATE"))
            .andExpect(jsonPath("$.entityType").value("MyEntity"))
            .andExpect(jsonPath("$.entityId").value(123));
    }

    @Test
    void unauthorizedAccess_isForbidden() throws Exception {
        // No @WithMockUser → not authenticated
        mockMvc.perform(get("/users/audit"))
            .andExpect(status().isUnauthorized());
    }
}
