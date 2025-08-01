package com.infinity.courseservice.models;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;

import com.infinity.courseservice.enums.ActionOptions;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_event")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditEvent {

    @Id @GeneratedValue
    private Long id;

    @CreatedBy
    @Column(updatable = false, nullable = false)
    private Long actorId;

    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String service;       // e.g. "user-service"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionOptions action;        // "CREATE", "UPDATE", "DELETE"

    @Column(nullable = false)
    private String entityType;    // e.g. "User"

    @Column(nullable = false)
    private Long entityId;      // stringified id

    @Lob
    @Column(columnDefinition = "TEXT")
    private String beforeJson;    // JSON snapshot before change

    @Lob
    @Column(columnDefinition = "TEXT")
    private String afterJson;     // JSON snapshot after change
}
