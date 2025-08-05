package com.infinity.profileservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptReviewDTO {
    private Long transcriptId;
    private String reviewStatus; // PENDING, UNDER_REVIEW, APPROVED, REJECTED, NEEDS_CLARIFICATION  
    private String reviewComments;
}
