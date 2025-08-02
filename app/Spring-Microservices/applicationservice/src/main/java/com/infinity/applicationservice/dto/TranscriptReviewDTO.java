package com.infinity.applicationservice.dto;

import com.infinity.applicationservice.models.Transcript;
import lombok.Data;

@Data
public class TranscriptReviewDTO {
    private Long transcriptId;
    private Transcript.ReviewStatus reviewStatus;
    private String reviewComments;
}
