package com.infinity.profileservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.profileservice.dto.TranscriptStatusDTO;
import com.infinity.profileservice.models.Transcript;

@Component
public class TranscriptMapper {
    
    public TranscriptStatusDTO toTranscriptStatus(Transcript transcript) {
        if (transcript == null) {
            return new TranscriptStatusDTO(false, null, null, null, null);
        }
        
        return new TranscriptStatusDTO(
            true,
            transcript.getFileName(),
            transcript.getUploadDate().toString(),
            transcript.getFileSize(),
            transcript.getContentType()
        );
    }
}
