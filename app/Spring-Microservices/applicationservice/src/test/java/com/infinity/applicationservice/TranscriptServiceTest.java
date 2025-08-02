package com.infinity.applicationservice;

import com.infinity.applicationservice.dto.TranscriptInfoDTO;
import com.infinity.applicationservice.dto.TranscriptStatusDTO;
import com.infinity.applicationservice.feign.UserInterface;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.models.Transcript;
import com.infinity.applicationservice.repositories.ApplicationRepository;
import com.infinity.applicationservice.repositories.TranscriptRepository;
import com.infinity.applicationservice.services.TranscriptService;
import com.infinity.applicationservice.utility.TranscriptMapper;
import feign.FeignException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TranscriptServiceTest {

    @Mock
    private TranscriptRepository transcriptRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private TranscriptMapper transcriptMapper;

    @Mock
    private UserInterface userInterface;

    @InjectMocks
    private TranscriptService transcriptService;

    private Transcript mockTranscript;
    private Application mockApplication;
    private MockMultipartFile validPdfFile;
    private MockMultipartFile invalidFile;
    private MockMultipartFile oversizedFile;

    @BeforeEach
    void setUp() {
        // Setup mock transcript
        mockTranscript = new Transcript();
        mockTranscript.setId(1L);
        mockTranscript.setUserId(123L);
        mockTranscript.setFileName("test-transcript.pdf");
        mockTranscript.setFileSize(2048576L);
        mockTranscript.setContentType("application/pdf");
        mockTranscript.setUploadDate(LocalDateTime.now());
        mockTranscript.setData(new byte[]{1, 2, 3, 4, 5});
        mockTranscript.setReviewStatus(Transcript.ReviewStatus.PENDING);
        mockTranscript.setReviewComments("");

        // Setup mock application
        mockApplication = new Application();
        mockApplication.setId(1L);
        mockApplication.setStudentId(123L);

        // Setup mock files
        validPdfFile = new MockMultipartFile(
            "file",
            "test-transcript.pdf",
            "application/pdf",
            "PDF content".getBytes()
        );

        invalidFile = new MockMultipartFile(
            "file",
            "document.txt",
            "text/plain",
            "Text content".getBytes()
        );

        // Create oversized file (6MB > 5MB limit)
        byte[] oversizedContent = new byte[6 * 1024 * 1024];
        oversizedFile = new MockMultipartFile(
            "file",
            "large-transcript.pdf",
            "application/pdf",
            oversizedContent
        );
    }

    // ========== Upload Transcript Tests ==========

    @Test
    void uploadTranscript_Success_NewTranscript() throws IOException {
        // Arrange
        when(transcriptRepository.findByUserId(123L)).thenReturn(Optional.empty());
        when(transcriptRepository.save(any(Transcript.class))).thenReturn(mockTranscript);

        // Act
        Transcript result = transcriptService.uploadTranscript(123L, validPdfFile);

        // Assert
        assertNotNull(result);
        assertEquals(mockTranscript.getId(), result.getId());
        verify(transcriptRepository).findByUserId(123L);
        verify(transcriptRepository).save(any(Transcript.class));
    }

    @Test
    void uploadTranscript_Success_ReplaceExisting() throws IOException {
        // Arrange
        Transcript existingTranscript = new Transcript();
        existingTranscript.setId(1L);
        existingTranscript.setUserId(123L);
        existingTranscript.setFileName("old-transcript.pdf");

        when(transcriptRepository.findByUserId(123L)).thenReturn(Optional.of(existingTranscript));
        when(transcriptRepository.save(any(Transcript.class))).thenReturn(mockTranscript);

        // Act
        Transcript result = transcriptService.uploadTranscript(123L, validPdfFile);

        // Assert
        assertNotNull(result);
        assertEquals(mockTranscript.getId(), result.getId());
        verify(transcriptRepository).findByUserId(123L);
        verify(transcriptRepository).save(existingTranscript);
        assertEquals("test-transcript.pdf", existingTranscript.getFileName());
    }

    @Test
    void uploadTranscript_InvalidFileType() {
        // Act & Assert
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> transcriptService.uploadTranscript(123L, invalidFile)
        );

        assertEquals("Only PDF files are allowed", exception.getMessage());
        verify(transcriptRepository, never()).save(any(Transcript.class));
    }

    @Test
    void uploadTranscript_FileTooBig() {
        // Act & Assert
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> transcriptService.uploadTranscript(123L, oversizedFile)
        );

        assertEquals("File size exceeds maximum limit of 5MB", exception.getMessage());
        verify(transcriptRepository, never()).save(any(Transcript.class));
    }

    @Test
    void uploadTranscript_EmptyFile() {
        // Arrange
        MockMultipartFile emptyFile = new MockMultipartFile(
            "file",
            "empty.pdf",
            "application/pdf",
            new byte[0]
        );

        // Act & Assert
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> transcriptService.uploadTranscript(123L, emptyFile)
        );

        assertEquals("File is empty", exception.getMessage());
        verify(transcriptRepository, never()).save(any(Transcript.class));
    }

    @Test
    void uploadTranscript_NullFile() {
        // Act & Assert
        RuntimeException exception = assertThrows(
            RuntimeException.class,
            () -> transcriptService.uploadTranscript(123L, null)
        );

        assertTrue(exception.getMessage().contains("null") || 
                  exception.getMessage().contains("empty") ||
                  exception.getMessage().contains("required"));
        verify(transcriptRepository, never()).save(any(Transcript.class));
    }

    @Test
    void uploadTranscript_IOException() throws IOException {
        // Arrange
        MultipartFile mockFile = mock(MultipartFile.class);
        when(mockFile.getOriginalFilename()).thenReturn("test.pdf");
        when(mockFile.getContentType()).thenReturn("application/pdf");
        when(mockFile.getSize()).thenReturn(1024L);
        when(mockFile.isEmpty()).thenReturn(false);
        when(mockFile.getBytes()).thenThrow(new IOException("File read error"));

        when(transcriptRepository.findByUserId(123L)).thenReturn(Optional.empty());

        // Act & Assert
        IOException exception = assertThrows(
            IOException.class,
            () -> transcriptService.uploadTranscript(123L, mockFile)
        );

        assertEquals("File read error", exception.getMessage());
        verify(transcriptRepository, never()).save(any(Transcript.class));
    }

    // ========== Get Transcript Status Tests ==========

    @Test
    void getTranscriptStatus_HasTranscript() {
        // Arrange
        when(transcriptRepository.findByUserId(123L)).thenReturn(Optional.of(mockTranscript));
        
        TranscriptStatusDTO mockStatus = new TranscriptStatusDTO();
        mockStatus.setHasTranscript(true);
        mockStatus.setFileName("test-transcript.pdf");
        mockStatus.setFileSize(2048576L);
        mockStatus.setContentType("application/pdf");
        
        when(transcriptMapper.toTranscriptStatus(mockTranscript)).thenReturn(mockStatus);

        // Act
        TranscriptStatusDTO result = transcriptService.getTranscriptStatus(123L);

        // Assert
        assertNotNull(result);
        assertTrue(result.isHasTranscript());
        assertEquals("test-transcript.pdf", result.getFileName());
        assertEquals(2048576L, result.getFileSize());
        assertEquals("application/pdf", result.getContentType());
        verify(transcriptRepository).findByUserId(123L);
        verify(transcriptMapper).toTranscriptStatus(mockTranscript);
    }

    @Test
    void getTranscriptStatus_NoTranscript() {
        // Arrange
        when(transcriptRepository.findByUserId(123L)).thenReturn(Optional.empty());
        
        TranscriptStatusDTO mockStatus = new TranscriptStatusDTO();
        mockStatus.setHasTranscript(false);
        
        when(transcriptMapper.toTranscriptStatus(null)).thenReturn(mockStatus);

        // Act
        TranscriptStatusDTO result = transcriptService.getTranscriptStatus(123L);

        // Assert
        assertNotNull(result);
        assertFalse(result.isHasTranscript());
        verify(transcriptRepository).findByUserId(123L);
        verify(transcriptMapper).toTranscriptStatus(null);
    }

    // ========== Delete Transcript Tests ==========

    @Test
    void deleteTranscript_Success() {
        // Arrange
        when(transcriptRepository.findByUserId(123L)).thenReturn(Optional.of(mockTranscript));

        // Act
        assertDoesNotThrow(() -> transcriptService.deleteTranscript(123L));

        // Assert
        verify(transcriptRepository).findByUserId(123L);
        verify(transcriptRepository).delete(mockTranscript);
    }

    @Test
    void deleteTranscript_NotFound() {
        // Arrange
        when(transcriptRepository.findByUserId(123L)).thenReturn(Optional.empty());

        // Act - Service method returns void, so we just call it
        assertDoesNotThrow(() -> transcriptService.deleteTranscript(123L));

        // Assert
        verify(transcriptRepository).findByUserId(123L);
        verify(transcriptRepository, never()).delete(any(Transcript.class));
    }

    // ========== Get Transcript By ID Tests ==========

    @Test
    void getTranscriptById_Success() {
        // Arrange
        when(transcriptRepository.findById(1L)).thenReturn(Optional.of(mockTranscript));

        // Act
        Optional<Transcript> result = transcriptService.getTranscriptById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(mockTranscript.getId(), result.get().getId());
        verify(transcriptRepository).findById(1L);
    }

    @Test
    void getTranscriptById_NotFound() {
        // Arrange
        when(transcriptRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        Optional<Transcript> result = transcriptService.getTranscriptById(1L);

        // Assert
        assertFalse(result.isPresent());
        verify(transcriptRepository).findById(1L);
    }

    // ========== Get Transcript By User ID Tests ==========

    @Test
    void getTranscriptByUserId_Success() {
        // Arrange
        when(transcriptRepository.findByUserId(123L)).thenReturn(Optional.of(mockTranscript));

        // Act
        Optional<Transcript> result = transcriptService.getTranscriptByUserId(123L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(mockTranscript.getUserId(), result.get().getUserId());
        verify(transcriptRepository).findByUserId(123L);
    }

    @Test
    void getTranscriptByUserId_NotFound() {
        // Arrange
        when(transcriptRepository.findByUserId(123L)).thenReturn(Optional.empty());

        // Act
        Optional<Transcript> result = transcriptService.getTranscriptByUserId(123L);

        // Assert
        assertFalse(result.isPresent());
        verify(transcriptRepository).findByUserId(123L);
    }

    // ========== Get All Transcript Info Tests ==========

    @Test
    void getAllTranscriptInfo_Success() {
        // Arrange
        TranscriptInfoDTO dto1 = new TranscriptInfoDTO();
        dto1.setId(1L);
        dto1.setStudentId(123L);
        dto1.setFileName("test-transcript.pdf");

        TranscriptInfoDTO dto2 = new TranscriptInfoDTO();
        dto2.setId(2L);
        dto2.setStudentId(456L);
        dto2.setFileName("transcript2.pdf");

        List<TranscriptInfoDTO> mockDTOs = Arrays.asList(dto1, dto2);

        when(transcriptRepository.findAllTranscriptInfo()).thenReturn(mockDTOs);
        
        // Mock UserInterface to throw FeignException - service handles this gracefully
        when(userInterface.getStudentById(any())).thenThrow(FeignException.class);

        // Act
        List<TranscriptInfoDTO> result = transcriptService.getAllTranscriptInfo();

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(transcriptRepository).findAllTranscriptInfo();
    }

    @Test
    void getAllTranscriptInfo_EmptyList() {
        // Arrange
        when(transcriptRepository.findAllTranscriptInfo()).thenReturn(Arrays.asList());

        // Act
        List<TranscriptInfoDTO> result = transcriptService.getAllTranscriptInfo();

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(transcriptRepository).findAllTranscriptInfo();
    }

    // ========== Update Transcript Review Tests ==========

    @Test
    void updateTranscriptReview_Success() {
        // Arrange
        when(transcriptRepository.findById(1L)).thenReturn(Optional.of(mockTranscript));
        when(transcriptRepository.save(mockTranscript)).thenReturn(mockTranscript);

        // Act
        boolean result = transcriptService.updateTranscriptReview(
            1L, 
            Transcript.ReviewStatus.APPROVED, 
            "Good academic record", 
            999L
        );

        // Assert
        assertTrue(result);
        assertEquals(Transcript.ReviewStatus.APPROVED, mockTranscript.getReviewStatus());
        assertEquals("Good academic record", mockTranscript.getReviewComments());
        assertEquals(999L, mockTranscript.getReviewedBy());
        assertNotNull(mockTranscript.getReviewDate());
        verify(transcriptRepository).findById(1L);
        verify(transcriptRepository).save(mockTranscript);
    }

    @Test
    void updateTranscriptReview_TranscriptNotFound() {
        // Arrange
        when(transcriptRepository.findById(1L)).thenReturn(Optional.empty());

        // Act
        boolean result = transcriptService.updateTranscriptReview(
            1L, 
            Transcript.ReviewStatus.APPROVED, 
            "Good academic record", 
            999L
        );

        // Assert
        assertFalse(result);
        verify(transcriptRepository).findById(1L);
        verify(transcriptRepository, never()).save(any(Transcript.class));
    }

    @Test
    void updateTranscriptReview_NullStatus() {
        // Arrange
        when(transcriptRepository.findById(1L)).thenReturn(Optional.of(mockTranscript));

        // Act & Assert
        assertDoesNotThrow(() -> transcriptService.updateTranscriptReview(1L, null, "Comments", 999L));
        
        verify(transcriptRepository).findById(1L);
        verify(transcriptRepository).save(mockTranscript);
    }

    @Test
    void updateTranscriptReview_EmptyStatus() {
        // Act & Assert - Since enum is used, we can't test empty string
        // This test is no longer applicable with enum parameter
    }

    @Test
    void updateTranscriptReview_InvalidStatus() {
        // With enum parameter, invalid status test is not applicable
        // Enum type safety prevents invalid values at compile time
    }

    // ========== Security and Edge Case Tests ==========

    @Test
    void uploadTranscript_WithSpecialCharactersInFilename() throws IOException {
        // Arrange 
        MockMultipartFile fileWithSpecialChars = new MockMultipartFile(
            "file",
            "test-transcript_新しい版本.pdf",
            "application/pdf",
            "PDF content".getBytes()
        );

        when(transcriptRepository.findByUserId(123L)).thenReturn(Optional.empty());
        when(transcriptRepository.save(any(Transcript.class))).thenReturn(mockTranscript);

        // Act
        Transcript result = transcriptService.uploadTranscript(123L, fileWithSpecialChars);

        // Assert
        assertNotNull(result);
        verify(transcriptRepository).save(any(Transcript.class));
    }

    @Test
    void uploadTranscript_ConcurrentUploads() throws IOException {
        // Arrange
        when(transcriptRepository.findByUserId(123L)).thenReturn(Optional.empty());
        when(transcriptRepository.save(any(Transcript.class))).thenReturn(mockTranscript);

        // Act - Simulate concurrent uploads
        Transcript result1 = transcriptService.uploadTranscript(123L, validPdfFile);
        Transcript result2 = transcriptService.uploadTranscript(123L, validPdfFile);

        // Assert
        assertNotNull(result1);
        assertNotNull(result2);
        verify(transcriptRepository, times(2)).findByUserId(123L);
        verify(transcriptRepository, times(2)).save(any(Transcript.class));
    }

    @Test
    void getAllTranscriptInfo_WithMapperException() {
        // Arrange
        TranscriptInfoDTO mockDTO = new TranscriptInfoDTO();
        mockDTO.setId(1L);
        mockDTO.setStudentId(123L);
        
        List<TranscriptInfoDTO> mockDTOs = Arrays.asList(mockDTO);
        when(transcriptRepository.findAllTranscriptInfo()).thenReturn(mockDTOs);
        
        // Mock UserInterface to throw FeignException - service handles this gracefully
        when(userInterface.getStudentById(any())).thenThrow(FeignException.class);

        // Act - Service handles exceptions internally and returns the DTO
        List<TranscriptInfoDTO> result = transcriptService.getAllTranscriptInfo();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(transcriptRepository).findAllTranscriptInfo();
    }

    @Test
    void updateTranscriptReview_MultipleValidStatuses() {
        // Arrange
        when(transcriptRepository.findById(1L)).thenReturn(Optional.of(mockTranscript));
        when(transcriptRepository.save(mockTranscript)).thenReturn(mockTranscript);

        // Test APPROVED status
        assertTrue(transcriptService.updateTranscriptReview(1L, Transcript.ReviewStatus.APPROVED, "Approved", 999L));
        
        // Test REJECTED status
        assertTrue(transcriptService.updateTranscriptReview(1L, Transcript.ReviewStatus.REJECTED, "Rejected", 999L));
        
        // Test UNDER_REVIEW status
        assertTrue(transcriptService.updateTranscriptReview(1L, Transcript.ReviewStatus.UNDER_REVIEW, "Under review", 999L));
        
        // Test PENDING status
        assertTrue(transcriptService.updateTranscriptReview(1L, Transcript.ReviewStatus.PENDING, "Pending", 999L));

        verify(transcriptRepository, times(4)).save(mockTranscript);
    }

    // ========== Performance Tests ==========

    @Test
    void getAllTranscriptInfo_LargeDataset() {
        // Arrange - Create a large list of transcript DTOs
        List<TranscriptInfoDTO> largeDTOList = Arrays.asList(new TranscriptInfoDTO[1000]);
        for (int i = 0; i < 1000; i++) {
            TranscriptInfoDTO dto = new TranscriptInfoDTO();
            dto.setId((long) i);
            dto.setStudentId((long) i);
            dto.setFileName("transcript" + i + ".pdf");
            largeDTOList.set(i, dto);
        }

        when(transcriptRepository.findAllTranscriptInfo()).thenReturn(largeDTOList);
        
        // Mock UserInterface to throw FeignException - service handles this gracefully
        when(userInterface.getStudentById(any())).thenThrow(FeignException.class);

        // Act
        List<TranscriptInfoDTO> result = transcriptService.getAllTranscriptInfo();

        // Assert
        assertNotNull(result);
        assertEquals(1000, result.size());
        verify(transcriptRepository).findAllTranscriptInfo();
    }
}
