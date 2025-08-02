package com.infinity.applicationservice.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Transcript {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Optional relationship with Application - allows for flexible workflow where students
    // can upload transcripts before creating an application, and transcripts can be
    // associated with applications later when they are created
    @ManyToOne
    @JoinColumn(name = "application_id", nullable = true)
    private Application application;

    // Store userId directly to enable transcript management independent of application status
    // This supports scenarios where students upload transcripts early in the process
    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private Long fileSize;

    @Column(nullable = false)
    private LocalDateTime uploadDate;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    private byte[] data;

    @PrePersist
    @PreUpdate
    protected void onCreateOrUpdate() {
        uploadDate = LocalDateTime.now();
    }
}