package com.infinity.applicationservice.controllers;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.infinity.applicationservice.dto.TranscriptInfoDTO;
import com.infinity.applicationservice.models.Transcript;
import com.infinity.applicationservice.services.TranscriptService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/transcripts")
public class TranscriptController {
    
    private final TranscriptService transcriptService;
    
    @PostMapping("/upload")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> uploadTranscript(@RequestParam("file") MultipartFile file) {
        try {
            // Get user ID from JWT token (this is the authoritative source)
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = Long.parseLong(username);
            
            Transcript transcript = transcriptService.uploadTranscript(userId, file);
            
            return ResponseEntity.ok()
                .body("Transcript uploaded successfully with ID: " + transcript.getId());
                
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error processing file: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(e.getMessage());
        }
    }
    
    @GetMapping("/status")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getTranscriptStatus() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = Long.parseLong(username);
            
            return transcriptService.getTranscriptByUserId(userId)
                .map(transcript -> ResponseEntity.ok()
                    .body(new TranscriptStatus(
                        true, 
                        transcript.getFileName(), 
                        transcript.getUploadDate().toString(),
                        transcript.getFileSize()
                    )))
                .orElse(ResponseEntity.ok()
                    .body(new TranscriptStatus(false, null, null, null)));
                    
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving transcript status: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> deleteTranscript() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Long userId = Long.parseLong(username);
            
            transcriptService.deleteTranscript(userId);
            
            return ResponseEntity.ok()
                .body("Transcript deleted successfully");
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting transcript: " + e.getMessage());
        }
    }
    
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<TranscriptInfoDTO>> getAllTranscripts() {
        List<TranscriptInfoDTO> transcripts = transcriptService.getAllTranscriptInfo();
        return ResponseEntity.ok(transcripts);
    }
    
    @GetMapping("/download/{transcriptId}")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<?> downloadTranscript(@PathVariable Long transcriptId) {
        try {
            return transcriptService.getTranscriptById(transcriptId)
                .map(transcript -> {
                    return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + transcript.getFileName() + "\"")
                        .contentType(MediaType.APPLICATION_PDF)
                        .contentLength(transcript.getData().length)
                        .body(transcript.getData());
                })
                .orElse(ResponseEntity.notFound().build());
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error downloading transcript: " + e.getMessage());
        }
    }
    
    // Inner class for transcript status response
    public static class TranscriptStatus {
        public boolean hasTranscript;
        public String fileName;
        public String uploadDate;
        public Long fileSize;
        
        public TranscriptStatus(boolean hasTranscript, String fileName, String uploadDate, Long fileSize) {
            this.hasTranscript = hasTranscript;
            this.fileName = fileName;
            this.uploadDate = uploadDate;
            this.fileSize = fileSize;
        }
    }
}
