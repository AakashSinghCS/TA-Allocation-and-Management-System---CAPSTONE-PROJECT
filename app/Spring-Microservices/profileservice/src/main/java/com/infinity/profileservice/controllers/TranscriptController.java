package com.infinity.profileservice.controllers;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpHeaders;
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

import com.infinity.profileservice.dto.TranscriptInfoDTO;
import com.infinity.profileservice.dto.TranscriptStatusDTO;
import com.infinity.profileservice.models.Transcript;
import com.infinity.profileservice.services.TranscriptService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/transcripts")
public class TranscriptController {
    
    private final TranscriptService transcriptService;
    
    @PostMapping("/upload")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> uploadTranscript(@RequestParam("file") MultipartFile file) throws IOException {
        // Get user ID from JWT token (this is the authoritative source)
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Long userId = Long.parseLong(username);
        
        Transcript transcript = transcriptService.uploadTranscript(userId, file);
        
        return ResponseEntity.ok("Transcript uploaded successfully with ID: " + transcript.getId());
    }
    
    @GetMapping("/status")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<TranscriptStatusDTO> getTranscriptStatus() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Long userId = Long.parseLong(username);
        
        TranscriptStatusDTO status = transcriptService.getTranscriptStatus(userId);
        return ResponseEntity.ok(status);
    }
    
    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<String> deleteTranscript() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();  
        Long userId = Long.parseLong(username);
        
        transcriptService.deleteTranscript(userId);
        
        return ResponseEntity.ok("Transcript deleted successfully");
    }
    
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<List<TranscriptInfoDTO>> getAllTranscripts() {
        List<TranscriptInfoDTO> transcripts = transcriptService.getAllTranscriptInfo();
        return ResponseEntity.ok(transcripts);
    }
    
    @GetMapping("/download")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<byte[]> downloadMyTranscript() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Long userId = Long.parseLong(username);
        
        return transcriptService.getTranscriptByUserId(userId)
            .map(transcript -> {
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + transcript.getFileName() + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(transcript.getData().length)
                    .body(transcript.getData());
            })
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/download/{transcriptId}")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<byte[]> downloadTranscript(@PathVariable Long transcriptId) {
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
    }
}
