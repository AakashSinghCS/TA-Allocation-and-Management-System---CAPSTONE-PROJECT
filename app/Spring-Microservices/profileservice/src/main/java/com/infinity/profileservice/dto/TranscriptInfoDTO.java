package com.infinity.profileservice.dto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptInfoDTO {
    private Long transcriptId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String studentNumber;
    private String fileName;
    private String uploadDate;
    private Long fileSize;
    private String contentType;
    
    // Review workflow fields
    private String reviewStatus;
    private String reviewComments;
    private Long reviewedBy;
    private String reviewDate;
    private String reviewerName;
    
    public TranscriptInfoDTO(Long transcriptId, Long studentId, String fileName, LocalDateTime uploadDate, Long fileSize) {
        this.transcriptId = transcriptId;
        this.studentId = studentId;
        this.fileName = fileName;
        this.uploadDate = uploadDate != null ? uploadDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "Unknown";
        this.fileSize = fileSize;
        // Initialize with default values
        this.studentName = "Unknown";
        this.studentEmail = "Unknown";
        this.studentNumber = "Unknown";
        this.reviewStatus = "PENDING";
    }
}
