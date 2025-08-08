package com.infinity.profileservice.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Transcript {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Store userId directly to enable transcript management independent of application status
    // This supports scenarios where students upload transcripts as part of their profile
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

    // Review workflow fields
    @Column(nullable = false)
    private String reviewStatus = "PENDING"; // PENDING, UNDER_REVIEW, APPROVED, REJECTED, NEEDS_CLARIFICATION

    @Column(columnDefinition = "TEXT")
    private String reviewComments;

    @Column
    private Long reviewedBy; // User ID of the reviewer

    @Column
    private LocalDateTime reviewDate;

    @PrePersist
    protected void onCreate() {
        uploadDate = LocalDateTime.now();
    }
}
