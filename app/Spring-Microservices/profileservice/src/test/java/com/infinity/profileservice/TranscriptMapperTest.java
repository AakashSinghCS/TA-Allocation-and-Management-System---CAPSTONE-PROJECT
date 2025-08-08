package com.infinity.profileservice;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.infinity.profileservice.dto.TranscriptStatusDTO;
import com.infinity.profileservice.models.Transcript;
import com.infinity.profileservice.utility.TranscriptMapper;

class TranscriptMapperTest {

    private TranscriptMapper transcriptMapper;
    private Transcript testTranscript;

    @BeforeEach
    void setUp() {
        transcriptMapper = new TranscriptMapper();
        
        testTranscript = new Transcript();
        testTranscript.setId(1L);
        testTranscript.setUserId(123L);
        testTranscript.setFileName("test-transcript.pdf");
        testTranscript.setContentType("application/pdf");
        testTranscript.setFileSize(2048576L);
        testTranscript.setUploadDate(LocalDateTime.of(2024, 1, 15, 10, 30));
        testTranscript.setData(new byte[]{1, 2, 3, 4, 5});
    }

    @Test
    void toTranscriptStatus_WithValidTranscript_ShouldReturnTranscriptStatusDTO() {
        // When
        TranscriptStatusDTO result = transcriptMapper.toTranscriptStatus(testTranscript);

        // Then
        assertNotNull(result);
        assertTrue(result.isHasTranscript());
        assertEquals("test-transcript.pdf", result.getFileName());
        assertEquals("2024-01-15T10:30", result.getUploadDate());
        assertEquals(2048576L, result.getFileSize());
        assertEquals("application/pdf", result.getContentType());
    }

    @Test
    void toTranscriptStatus_WithNullTranscript_ShouldReturnEmptyTranscriptStatusDTO() {
        // When
        TranscriptStatusDTO result = transcriptMapper.toTranscriptStatus(null);

        // Then
        assertNotNull(result);
        assertFalse(result.isHasTranscript());
        assertNull(result.getFileName());
        assertNull(result.getUploadDate());
        assertNull(result.getFileSize());
        assertNull(result.getContentType());
    }

    @Test
    void toTranscriptStatus_WithMinimalTranscript_ShouldMapAllRequiredFields() {
        // Given
        Transcript minimalTranscript = new Transcript();
        minimalTranscript.setId(2L);
        minimalTranscript.setUserId(456L);
        minimalTranscript.setFileName("minimal.pdf");
        minimalTranscript.setContentType("application/pdf");
        minimalTranscript.setFileSize(1024L);
        minimalTranscript.setUploadDate(LocalDateTime.of(2024, 12, 25, 23, 59));
        minimalTranscript.setData(new byte[]{});

        // When
        TranscriptStatusDTO result = transcriptMapper.toTranscriptStatus(minimalTranscript);

        // Then
        assertNotNull(result);
        assertTrue(result.isHasTranscript());
        assertEquals("minimal.pdf", result.getFileName());
        assertEquals("2024-12-25T23:59", result.getUploadDate());
        assertEquals(1024L, result.getFileSize());
        assertEquals("application/pdf", result.getContentType());
    }

    @Test
    void toTranscriptStatus_WithLargeFile_ShouldHandleLargeFileSize() {
        // Given
        Long largeFileSize = 5 * 1024 * 1024L; // 5MB
        testTranscript.setFileSize(largeFileSize);

        // When
        TranscriptStatusDTO result = transcriptMapper.toTranscriptStatus(testTranscript);

        // Then
        assertNotNull(result);
        assertTrue(result.isHasTranscript());
        assertEquals(largeFileSize, result.getFileSize());
    }

    @Test
    void toTranscriptStatus_WithSpecialCharactersInFileName_ShouldPreserveFileName() {
        // Given
        String specialFileName = "transcript_with-special.chars_2024.pdf";
        testTranscript.setFileName(specialFileName);

        // When
        TranscriptStatusDTO result = transcriptMapper.toTranscriptStatus(testTranscript);

        // Then
        assertNotNull(result);
        assertTrue(result.isHasTranscript());
        assertEquals(specialFileName, result.getFileName());
    }
}
