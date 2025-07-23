package com.infinity.userservice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.infinity.userservice.controllers.AuditController;
import com.infinity.userservice.dtos.AuditEventDto;
import com.infinity.userservice.enums.ActionOptions;
import com.infinity.userservice.services.AuditService;


@WebMvcTest(AuditController.class)
class AuditControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuditService auditService;

    private AuditEventDto sampleEventDto;

    @BeforeEach
    void setUp() {
        sampleEventDto = new AuditEventDto(
                1L,
                99L,
                "Alice Smith",
                LocalDateTime.of(2025, 7, 16, 12, 0),
                "user-service",
                ActionOptions.CREATE,
                "User",
                123L,
                "Bob Johnson",
                "{\"foo\":\"bar\"}",
                null);
    }

    @WithMockUser(roles = "ADMIN")
    @Test
    void search_returnsPagedAuditEvents() throws Exception {
        List<AuditEventDto> list = List.of(sampleEventDto, sampleEventDto);
        Page<AuditEventDto> page = new PageImpl<>(
                list,
                PageRequest.of(0, 2),
                list.size());

        when(auditService.search(
                any(Pageable.class),
                eq("user-service"),
                eq("User"),
                eq(123L),
                eq(ActionOptions.CREATE),
                eq(99L),
                eq("2025-07-16"))).thenReturn(page);

        mockMvc.perform(get("/users/audit")
                .param("page", "0")
                .param("size", "2")
                .param("service", "user-service")
                .param("entityType", "User")
                .param("entityId", "123")
                .param("action", "CREATE")
                .param("actorId", "99")
                .param("dateOnly", "2025-07-16"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[0].actorName").value("Alice Smith"))
                .andExpect(jsonPath("$.content[0].entityName").value("Bob Johnson"))
                .andExpect(jsonPath("$.content[0].service").value("user-service"))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.size").value(2))
                .andExpect(jsonPath("$.number").value(0));
    }

    @WithMockUser(roles = "ADMIN")
    @Test
    void getById_returnsSingleAuditEventDto() throws Exception {
        when(auditService.getById(1L)).thenReturn(sampleEventDto);

        mockMvc.perform(get("/users/audit/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.actorId").value(99))
                .andExpect(jsonPath("$.actorName").value("Alice Smith"))
                .andExpect(jsonPath("$.entityId").value(123))
                .andExpect(jsonPath("$.entityName").value("Bob Johnson"))
                .andExpect(jsonPath("$.service").value("user-service"));
    }

    @Test
    void unauthorizedAccess_isForbidden() throws Exception {
        mockMvc.perform(get("/users/audit"))
                .andExpect(status().isUnauthorized());
    }
}
