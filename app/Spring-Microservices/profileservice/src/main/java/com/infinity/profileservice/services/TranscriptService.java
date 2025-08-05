package com.infinity.profileservice.services;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.infinity.profileservice.dto.TranscriptInfoDTO;
import com.infinity.profileservice.dto.TranscriptReviewDTO;
import com.infinity.profileservice.dto.TranscriptStatusDTO;
import com.infinity.profileservice.dtos.UserDto;
import com.infinity.profileservice.feign.UserInterface;
import com.infinity.profileservice.models.Transcript;
import com.infinity.profileservice.repositories.TranscriptRepository;
import com.infinity.profileservice.utility.TranscriptMapper;

import feign.FeignException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TranscriptService {
    
    private final TranscriptRepository transcriptRepository;
    private final TranscriptMapper transcriptMapper;
    private final UserInterface userInterface;
    
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String ALLOWED_CONTENT_TYPE = "application/pdf";
    
    @Transactional
    public Transcript uploadTranscript(Long userId, MultipartFile file) throws IOException {
        // Validation
        validateFile(file);
        
        // Check if transcript already exists for this user - if so, replace it
        Optional<Transcript> existingTranscript = transcriptRepository.findByUserId(userId);
        
        Transcript transcript;
        if (existingTranscript.isPresent()) {
            // Replace existing transcript
            transcript = existingTranscript.get();
            transcript.setFileName(file.getOriginalFilename());
            transcript.setContentType(file.getContentType());
            transcript.setFileSize(file.getSize());
            transcript.setData(file.getBytes());
            // Update timestamp will be handled by @PrePersist in the entity
        } else {
            // Create new transcript
            transcript = new Transcript();
            transcript.setUserId(userId);
            transcript.setFileName(file.getOriginalFilename());
            transcript.setContentType(file.getContentType());
            transcript.setFileSize(file.getSize());
            transcript.setData(file.getBytes());
        }
        
        return transcriptRepository.save(transcript);
    }
    
    public Optional<Transcript> getTranscriptByUserId(Long userId) {
        return transcriptRepository.findByUserId(userId);
    }
    
    public Optional<Transcript> getTranscriptById(Long transcriptId) {
        return transcriptRepository.findById(transcriptId);
    }
    
    public List<TranscriptInfoDTO> getAllTranscriptInfo() {
        List<Transcript> transcripts = transcriptRepository.findAllTranscriptsForInfo();
        
        // Convert to DTOs and enrich with user information
        return transcripts.stream()
                .map(this::convertToTranscriptInfoDTO)
                .map(transcript -> enrichWithUserInfo(transcript, userIdFromHeader, headerRoles))
                .collect(Collectors.toList());
    }
    
    private TranscriptInfoDTO convertToTranscriptInfoDTO(Transcript transcript) {
        TranscriptInfoDTO dto = new TranscriptInfoDTO();
        dto.setTranscriptId(transcript.getId());
        dto.setStudentId(transcript.getUserId());
        dto.setFileName(transcript.getFileName());
        // Use ISO format with time for proper frontend parsing
        dto.setUploadDate(transcript.getUploadDate() != null ? transcript.getUploadDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "Unknown");
        dto.setFileSize(transcript.getFileSize());
        dto.setContentType(transcript.getContentType());
        dto.setReviewStatus(transcript.getReviewStatus());
        dto.setReviewComments(transcript.getReviewComments());
        dto.setReviewedBy(transcript.getReviewedBy());
        // Use ISO format with time for proper frontend parsing
        dto.setReviewDate(transcript.getReviewDate() != null ? transcript.getReviewDate().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "");
        
        // Set default values for user info (will be enriched later)
        dto.setStudentName("Unknown");
        dto.setStudentEmail("Unknown");
        dto.setStudentNumber("Unknown");
        dto.setReviewerName("");
        
        return dto;
    }
    
    private TranscriptInfoDTO enrichWithUserInfo(TranscriptInfoDTO transcriptInfo, Long userIdFromHeader, List<String> headerRoles) {
        try {
            UserDto userDto = userInterface.getUserDetailsById(transcriptInfo.getStudentId(), 
                    headerRoles, userIdFromHeader).getBody();
            if (userDto != null) {
                transcriptInfo.setStudentName(userDto.firstName() + " " + userDto.lastName());
                transcriptInfo.setStudentEmail(userDto.email());
                transcriptInfo.setStudentNumber(userDto.studentNum() != null ? userDto.studentNum().toString() : "");
            }
            
            // Enrich reviewer information if available
            if (transcriptInfo.getReviewedBy() != null) {
                try {
                    UserDto reviewerDto = userInterface.getUserDetailsById(transcriptInfo.getReviewedBy(), headerRoles, userIdFromHeader).getBody();
                    if (reviewerDto != null) {
                        transcriptInfo.setReviewerName(reviewerDto.firstName() + " " + reviewerDto.lastName());
                    }
                } catch (FeignException e) {
                    // Log the error but don't fail - reviewer info is optional
                    System.err.println("Failed to fetch reviewer info for ID " + transcriptInfo.getReviewedBy() + ": " + e.getMessage());
                }
            }
            
        } catch (FeignException e) {
            // Log the error but don't fail the entire operation
            System.err.println("Failed to fetch user info for student ID " + transcriptInfo.getStudentId() + ": " + e.getMessage());
            // Keep the default values set by the DTO constructor
        }
        return transcriptInfo;
    }
    
    @Transactional
    public void deleteTranscript(Long userId) {
        Optional<Transcript> transcript = transcriptRepository.findByUserId(userId);
        if (transcript.isPresent()) {
            transcriptRepository.delete(transcript.get());
        }
    }
    
    public TranscriptStatusDTO getTranscriptStatus(Long userId) {
        Optional<Transcript> transcript = transcriptRepository.findByUserId(userId);
        return transcriptMapper.toTranscriptStatus(transcript.orElse(null));
    }
    
    @Transactional
    public void updateTranscriptReview(TranscriptReviewDTO reviewDTO, Long reviewerId) {
        Optional<Transcript> optionalTranscript = transcriptRepository.findById(reviewDTO.getTranscriptId());
        
        if (optionalTranscript.isEmpty()) {
            throw new RuntimeException("Transcript not found with ID: " + reviewDTO.getTranscriptId());
        }
        
        Transcript transcript = optionalTranscript.get();
        transcript.setReviewStatus(reviewDTO.getReviewStatus());
        transcript.setReviewComments(reviewDTO.getReviewComments());
        transcript.setReviewedBy(reviewerId);
        transcript.setReviewDate(LocalDateTime.now());
        
        transcriptRepository.save(transcript);
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
        if (filename == null) {
            throw new RuntimeException("File name is required");
        }
        
        // Check for dangerous characters in filename
        if (filename.matches(".*[<>:\"|?*\\x00-\\x1f\\x7f-\\x9f].*")) {
            throw new RuntimeException("File name contains invalid characters");
        }
        
        // Check file extension
        if (!filename.toLowerCase().endsWith(".pdf")) {
            throw new RuntimeException("File must have .pdf extension");
        }
        
        // Check filename length
        if (filename.length() > 100) {
            throw new RuntimeException("File name is too long (maximum 100 characters)");
        }
        
        // Check for empty filename (just extension)
        String nameWithoutExtension = filename.substring(0, filename.length() - 4);
        if (nameWithoutExtension.trim().isEmpty()) {
            throw new RuntimeException("File name cannot be empty");
        }
    }
}
