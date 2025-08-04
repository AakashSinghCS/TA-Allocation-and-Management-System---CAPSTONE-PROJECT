package com.infinity.profileservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TranscriptStatusDTO {
    private boolean hasTranscript;
    private String fileName;
    private String uploadDate;
    private Long fileSize;
    private String contentType;
}
