package com.infinity.profileservice;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import com.infinity.profileservice.dto.TranscriptInfoDTO;
import com.infinity.profileservice.dto.TranscriptStatusDTO;
import com.infinity.profileservice.dtos.UserDto;
import com.infinity.profileservice.feign.UserInterface;
import com.infinity.profileservice.models.Transcript;
import com.infinity.profileservice.repositories.TranscriptRepository;
import com.infinity.profileservice.services.TranscriptService;
import com.infinity.profileservice.utility.TranscriptMapper;

import feign.FeignException;

@ExtendWith(MockitoExtension.class)
class TranscriptServiceTest {

    @Mock
    private TranscriptRepository transcriptRepository;

    @Mock
    private TranscriptMapper transcriptMapper;

    @Mock
    private UserInterface userInterface;

    @InjectMocks
    private TranscriptService transcriptService;

    private Transcript testTranscript;
    private MockMultipartFile validPdfFile;
    private Long userId;

    @BeforeEach
    void setUp() {
        userId = 123L;
        
        testTranscript = new Transcript();
        testTranscript.setId(1L);
        testTranscript.setUserId(userId);
        testTranscript.setFileName("test-transcript.pdf");
        testTranscript.setContentType("application/pdf");
        testTranscript.setFileSize(2048576L);
        testTranscript.setUploadDate(LocalDateTime.now());
        testTranscript.setData(new byte[]{1, 2, 3, 4, 5});

        validPdfFile = new MockMultipartFile(
            "file",
            "test-transcript.pdf",
            "application/pdf",
            "PDF content".getBytes()
        );
    }

    @Test
    void uploadTranscript_NewTranscript_ShouldCreateAndSaveTranscript() throws IOException {
        // Given
        when(transcriptRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(transcriptRepository.save(any(Transcript.class))).thenReturn(testTranscript);

        // When
        Transcript result = transcriptService.uploadTranscript(userId, validPdfFile);

        // Then
        assertNotNull(result);
        assertEquals(testTranscript, result);
        verify(transcriptRepository).findByUserId(userId);
        verify(transcriptRepository).save(any(Transcript.class));
    }

    @Test
    void uploadTranscript_ExistingTranscript_ShouldUpdateTranscript() throws IOException {
        // Given
        Transcript existingTranscript = new Transcript();
        existingTranscript.setId(1L);
        existingTranscript.setUserId(userId);
        existingTranscript.setFileName("old-transcript.pdf");
        
        when(transcriptRepository.findByUserId(userId)).thenReturn(Optional.of(existingTranscript));
        when(transcriptRepository.save(any(Transcript.class))).thenReturn(existingTranscript);

        // When
        Transcript result = transcriptService.uploadTranscript(userId, validPdfFile);

        // Then
        assertNotNull(result);
        assertEquals("test-transcript.pdf", result.getFileName());
        verify(transcriptRepository).findByUserId(userId);
        verify(transcriptRepository).save(existingTranscript);
    }

    @Test
    void uploadTranscript_EmptyFile_ShouldThrowRuntimeException() {
        // Given
        MockMultipartFile emptyFile = new MockMultipartFile(
            "file", "empty.pdf", "application/pdf", new byte[0]
        );

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> transcriptService.uploadTranscript(userId, emptyFile));
        assertEquals("File is empty", exception.getMessage());
        
        verify(transcriptRepository, never()).save(any());
    }

    @Test
    void uploadTranscript_FileTooLarge_ShouldThrowRuntimeException() {
        // Given
        byte[] largeContent = new byte[6 * 1024 * 1024]; // 6MB (over 5MB limit)
        MockMultipartFile largeFile = new MockMultipartFile(
            "file", "large.pdf", "application/pdf", largeContent
        );

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> transcriptService.uploadTranscript(userId, largeFile));
        assertEquals("File size exceeds maximum limit of 5MB", exception.getMessage());
        
        verify(transcriptRepository, never()).save(any());
    }

    @Test
    void uploadTranscript_InvalidContentType_ShouldThrowRuntimeException() {
        // Given
        MockMultipartFile invalidFile = new MockMultipartFile(
            "file", "document.txt", "text/plain", "Text content".getBytes()
        );

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> transcriptService.uploadTranscript(userId, invalidFile));
        assertEquals("Only PDF files are allowed", exception.getMessage());
        
        verify(transcriptRepository, never()).save(any());
    }

    @Test
    void uploadTranscript_InvalidFileExtension_ShouldThrowRuntimeException() {
        // Given
        MockMultipartFile invalidFile = new MockMultipartFile(
            "file", "document.txt", "application/pdf", "Content".getBytes()
        );

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> transcriptService.uploadTranscript(userId, invalidFile));
        assertEquals("File must have .pdf extension", exception.getMessage());
        
        verify(transcriptRepository, never()).save(any());
    }

    @Test
    void getTranscriptByUserId_ExistingTranscript_ShouldReturnTranscript() {
        // Given
        when(transcriptRepository.findByUserId(userId)).thenReturn(Optional.of(testTranscript));

        // When
        Optional<Transcript> result = transcriptService.getTranscriptByUserId(userId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testTranscript, result.get());
        verify(transcriptRepository).findByUserId(userId);
    }

    @Test
    void getTranscriptByUserId_NonExistentTranscript_ShouldReturnEmpty() {
        // Given
        when(transcriptRepository.findByUserId(userId)).thenReturn(Optional.empty());

        // When
        Optional<Transcript> result = transcriptService.getTranscriptByUserId(userId);

        // Then
        assertFalse(result.isPresent());
        verify(transcriptRepository).findByUserId(userId);
    }

    @Test
    void getAllTranscriptInfo_WithUserInfo_ShouldEnrichWithUserData() {
        // Given
        TranscriptInfoDTO transcriptInfo = new TranscriptInfoDTO(1L, userId, "test.pdf", LocalDateTime.of(2024, 1, 15, 10, 0), 1024L);
        when(transcriptRepository.findAllTranscriptInfo()).thenReturn(Arrays.asList(transcriptInfo));
        
        UserDto userDto = new UserDto(userId, "John", "Doe", "student@test.com", 
                                    Arrays.asList(), 12345, "Computer Science", 2024, 4, 
                                    null, null, LocalDateTime.now(), true);
        when(userInterface.getUserDetailsById(userId)).thenReturn(ResponseEntity.ok(userDto));

        // When
        List<TranscriptInfoDTO> result = transcriptService.getAllTranscriptInfo();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getStudentName());
        assertEquals("student@test.com", result.get(0).getStudentEmail());
        assertEquals("12345", result.get(0).getStudentNumber());
        
        verify(transcriptRepository).findAllTranscriptInfo();
        verify(userInterface).getUserDetailsById(userId);
    }

    @Test
    void getAllTranscriptInfo_FeignException_ShouldUseDefaultValues() {
        // Given
        TranscriptInfoDTO transcriptInfo = new TranscriptInfoDTO(1L, userId, "test.pdf", LocalDateTime.of(2024, 1, 15, 10, 0), 1024L);
        when(transcriptRepository.findAllTranscriptInfo()).thenReturn(Arrays.asList(transcriptInfo));
        when(userInterface.getUserDetailsById(userId)).thenThrow(FeignException.class);

        // When
        List<TranscriptInfoDTO> result = transcriptService.getAllTranscriptInfo();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Unknown", result.get(0).getStudentName());
        assertEquals("Unknown", result.get(0).getStudentEmail());
        assertEquals("Unknown", result.get(0).getStudentNumber());
        
        verify(transcriptRepository).findAllTranscriptInfo();
        verify(userInterface).getUserDetailsById(userId);
    }

    @Test
    void deleteTranscript_ExistingTranscript_ShouldDeleteTranscript() {
        // Given
        when(transcriptRepository.findByUserId(userId)).thenReturn(Optional.of(testTranscript));

        // When
        transcriptService.deleteTranscript(userId);

        // Then
        verify(transcriptRepository).findByUserId(userId);
        verify(transcriptRepository).delete(testTranscript);
    }

    @Test
    void deleteTranscript_NonExistentTranscript_ShouldNotThrowException() {
        // Given
        when(transcriptRepository.findByUserId(userId)).thenReturn(Optional.empty());

        // When & Then
        assertDoesNotThrow(() -> transcriptService.deleteTranscript(userId));
        
        verify(transcriptRepository).findByUserId(userId);
        verify(transcriptRepository, never()).delete(any());
    }

    @Test
    void getTranscriptStatus_ExistingTranscript_ShouldReturnStatus() {
        // Given
        TranscriptStatusDTO expectedStatus = new TranscriptStatusDTO(true, "test.pdf", "2024-01-15", 1024L, "application/pdf");
        when(transcriptRepository.findByUserId(userId)).thenReturn(Optional.of(testTranscript));
        when(transcriptMapper.toTranscriptStatus(testTranscript)).thenReturn(expectedStatus);

        // When
        TranscriptStatusDTO result = transcriptService.getTranscriptStatus(userId);

        // Then
        assertNotNull(result);
        assertEquals(expectedStatus, result);
        verify(transcriptRepository).findByUserId(userId);
        verify(transcriptMapper).toTranscriptStatus(testTranscript);
    }

    @Test
    void getTranscriptStatus_NonExistentTranscript_ShouldReturnEmptyStatus() {
        // Given
        TranscriptStatusDTO expectedStatus = new TranscriptStatusDTO(false, null, null, null, null);
        when(transcriptRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(transcriptMapper.toTranscriptStatus(null)).thenReturn(expectedStatus);

        // When
        TranscriptStatusDTO result = transcriptService.getTranscriptStatus(userId);

        // Then
        assertNotNull(result);
        assertEquals(expectedStatus, result);
        verify(transcriptRepository).findByUserId(userId);
        verify(transcriptMapper).toTranscriptStatus(null);
    }
}
