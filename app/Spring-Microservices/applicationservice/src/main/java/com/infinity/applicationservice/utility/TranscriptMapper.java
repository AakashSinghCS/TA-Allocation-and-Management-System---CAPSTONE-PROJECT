package com.infinity.applicationservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.applicationservice.dto.TranscriptInfoDTO;
import com.infinity.applicationservice.dto.TranscriptStatusDTO;
import com.infinity.applicationservice.models.Transcript;

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
    
    public TranscriptInfoDTO toTranscriptInfoDTO(Transcript transcript) {
        if (transcript == null) {
            return null;
        }
        
        TranscriptInfoDTO dto = new TranscriptInfoDTO();
        dto.setId(transcript.getId());
        dto.setStudentId(transcript.getUserId());
        dto.setFileName(transcript.getFileName());
        dto.setUploadDate(transcript.getUploadDate());
        dto.setFileSize(transcript.getFileSize());
        dto.setContentType(transcript.getContentType());
        
        // Review workflow fields
        dto.setReviewStatus(transcript.getReviewStatus());
        dto.setReviewComments(transcript.getReviewComments());
        dto.setReviewedBy(transcript.getReviewedBy());
        dto.setReviewDate(transcript.getReviewDate());
        
        return dto;
    }
}