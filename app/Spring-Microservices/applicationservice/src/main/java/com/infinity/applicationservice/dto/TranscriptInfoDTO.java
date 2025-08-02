package com.infinity.applicationservice.dto;

import java.time.LocalDateTime;

import com.infinity.applicationservice.models.Transcript;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptInfoDTO {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentNumber;
    private String fileName;
    private LocalDateTime uploadDate;
    private Long fileSize;
    private String contentType;
    
    // Review workflow fields
    private Transcript.ReviewStatus reviewStatus;
    private String reviewComments;
    private Long reviewedBy;
    private LocalDateTime reviewDate;
    private String reviewerName; // Name of the coordinator who reviewed
    
    // Constructor for basic info (without user details)
    public TranscriptInfoDTO(Long id, Long studentId, String fileName, LocalDateTime uploadDate, Long fileSize, String contentType) {
        this.id = id;
        this.studentId = studentId;
        this.fileName = fileName;
        this.uploadDate = uploadDate;
        this.fileSize = fileSize;
        this.contentType = contentType;
        // Set default values
        this.studentName = "Student " + studentId;
        this.studentEmail = "";
        this.studentNumber = "";
        this.reviewStatus = Transcript.ReviewStatus.PENDING;
    }
    
    // Constructor with review fields (for repository query)
    public TranscriptInfoDTO(Long id, Long studentId, String fileName, LocalDateTime uploadDate, Long fileSize, String contentType,
                           Transcript.ReviewStatus reviewStatus, String reviewComments, Long reviewedBy, LocalDateTime reviewDate) {
        this.id = id;
        this.studentId = studentId;
        this.fileName = fileName;
        this.uploadDate = uploadDate;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.reviewStatus = reviewStatus != null ? reviewStatus : Transcript.ReviewStatus.PENDING;
        this.reviewComments = reviewComments;
        this.reviewedBy = reviewedBy;
        this.reviewDate = reviewDate;
        // Set default values for user details (will be enriched later)
        this.studentName = "Student " + studentId;
        this.studentEmail = "";
        this.studentNumber = "";
    }
}
