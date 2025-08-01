package com.infinity.applicationservice.services;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.infinity.applicationservice.dto.TranscriptInfoDTO;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.models.Transcript;
import com.infinity.applicationservice.repositories.ApplicationRepository;
import com.infinity.applicationservice.repositories.TranscriptRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TranscriptService {
    
    private final TranscriptRepository transcriptRepository;
    private final ApplicationRepository applicationRepository;
    
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String ALLOWED_CONTENT_TYPE = "application/pdf";
    
    @Transactional
    public Transcript uploadTranscript(Long userId, MultipartFile file) throws IOException {
        // Validation
        validateFile(file);
        
        // Check if transcript already exists for this user
        if (transcriptRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("Transcript already exists for this user");
        }
        
        // Find user's application (optional - may not exist yet)
        Optional<Application> applicationOpt = applicationRepository.findByUserId(userId);
        
        // Create new transcript
        Transcript transcript = new Transcript();
        // Set application if it exists, otherwise it will be null
        applicationOpt.ifPresent(transcript::setApplication);
        transcript.setUserId(userId); // Store userId directly for cases where application doesn't exist yet
        transcript.setFileName(file.getOriginalFilename());
        transcript.setContentType(file.getContentType());
        transcript.setFileSize(file.getSize());
        transcript.setData(file.getBytes());
        
        return transcriptRepository.save(transcript);
    }
    
    public Optional<Transcript> getTranscriptByUserId(Long userId) {
        return transcriptRepository.findByUserId(userId);
    }
    
    public Optional<Transcript> getTranscriptById(Long transcriptId) {
        return transcriptRepository.findById(transcriptId);
    }
    
    public List<TranscriptInfoDTO> getAllTranscriptInfo() {
        return transcriptRepository.findAllTranscriptInfo();
    }
    
    @Transactional
    public void deleteTranscript(Long userId) {
        Optional<Transcript> transcript = transcriptRepository.findByUserId(userId);
        if (transcript.isPresent()) {
            transcriptRepository.delete(transcript.get());
        }
    }
    
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum limit of 5MB");
        }
        
        if (!ALLOWED_CONTENT_TYPE.equals(file.getContentType())) {
            throw new RuntimeException("Only PDF files are allowed");
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            throw new RuntimeException("File must have .pdf extension");
        }
    }
}
