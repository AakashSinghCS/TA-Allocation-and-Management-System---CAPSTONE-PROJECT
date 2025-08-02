package com.infinity.applicationservice;

import com.infinity.applicationservice.controllers.TranscriptController;
import com.infinity.applicationservice.dto.TranscriptStatusDTO;
import com.infinity.applicationservice.models.Transcript;
import com.infinity.applicationservice.services.TranscriptService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TranscriptController.class)
class TranscriptControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TranscriptService transcriptService;

    private Transcript mockTranscript;

    @BeforeEach
    void setUp() {
        mockTranscript = new Transcript();
        mockTranscript.setId(1L);
        mockTranscript.setUserId(123L);
        mockTranscript.setFileName("test-transcript.pdf");
        mockTranscript.setFileSize(2048576L);
        mockTranscript.setContentType("application/pdf");
        mockTranscript.setUploadDate(LocalDateTime.now());
        mockTranscript.setData(new byte[]{1, 2, 3, 4, 5});
    }

    @Test
    @WithMockUser(username = "123", roles = "STUDENT")
    void uploadTranscript_Success() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "test-transcript.pdf", 
            "application/pdf", 
            "PDF content".getBytes()
        );

        when(transcriptService.uploadTranscript(eq(123L), any(MultipartFile.class)))
            .thenReturn(mockTranscript);

        mockMvc.perform(multipart("/transcripts/upload")
                .file(file)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Transcript uploaded successfully with ID: 1"));

        verify(transcriptService).uploadTranscript(eq(123L), any(MultipartFile.class));
    }

        @Test
    @WithMockUser(username = "123", roles = "STUDENT")
    void uploadTranscript_InvalidFileType() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "document.txt", 
            "text/plain", 
            "Text content".getBytes()
        );

        when(transcriptService.uploadTranscript(eq(123L), any(MultipartFile.class)))
            .thenThrow(new RuntimeException("Only PDF files are allowed"));

        // The exception will be handled by GlobalExceptionHandler, returning 500
        mockMvc.perform(multipart("/transcripts/upload")
                .file(file)
                .with(csrf()))
                .andExpect(status().isInternalServerError());

        verify(transcriptService).uploadTranscript(eq(123L), any(MultipartFile.class));
    }

    @Test
    @WithMockUser(username = "123", roles = "STUDENT")
    void uploadTranscript_IOException() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "corrupted.pdf", 
            "application/pdf", 
            "Corrupted PDF content".getBytes()
        );

        when(transcriptService.uploadTranscript(eq(123L), any(MultipartFile.class)))
            .thenThrow(new IOException("File processing error"));

        // IOException will be handled by GlobalExceptionHandler, returning 500
        mockMvc.perform(multipart("/transcripts/upload")
                .file(file)
                .with(csrf()))
                .andExpect(status().isInternalServerError());

        verify(transcriptService).uploadTranscript(eq(123L), any(MultipartFile.class));
    }

    @Test
    @WithMockUser(username = "123", roles = "STUDENT")
    void getTranscriptStatus_HasTranscript() throws Exception {
        TranscriptStatusDTO statusDTO = new TranscriptStatusDTO(
            true, 
            "test-transcript.pdf", 
            mockTranscript.getUploadDate().toString(), 
            2048576L, 
            "application/pdf"
        );
        
        when(transcriptService.getTranscriptStatus(123L)).thenReturn(statusDTO);

        mockMvc.perform(get("/transcripts/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasTranscript").value(true))
                .andExpect(jsonPath("$.fileName").value("test-transcript.pdf"))
                .andExpect(jsonPath("$.fileSize").value(2048576))
                .andExpect(jsonPath("$.contentType").value("application/pdf"));

        verify(transcriptService).getTranscriptStatus(123L);
    }

    @Test
    @WithMockUser(username = "123", roles = "STUDENT")
    void getTranscriptStatus_NoTranscript() throws Exception {
        TranscriptStatusDTO statusDTO = new TranscriptStatusDTO(false, null, null, null, null);
        
        when(transcriptService.getTranscriptStatus(123L)).thenReturn(statusDTO);

        mockMvc.perform(get("/transcripts/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hasTranscript").value(false));

        verify(transcriptService).getTranscriptStatus(123L);
    }

    @Test
    @WithMockUser(username = "123", roles = "STUDENT")
    void downloadMyTranscript_Success() throws Exception {
        when(transcriptService.getTranscriptByUserId(123L)).thenReturn(Optional.of(mockTranscript));

        mockMvc.perform(get("/transcripts/download"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"test-transcript.pdf\""))
                .andExpect(content().bytes(mockTranscript.getData()));

        verify(transcriptService).getTranscriptByUserId(123L);
    }

    @Test
    @WithMockUser(username = "123", roles = "STUDENT")
    void downloadMyTranscript_NotFound() throws Exception {
        when(transcriptService.getTranscriptByUserId(123L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/transcripts/download"))
                .andExpect(status().isNotFound());

        verify(transcriptService).getTranscriptByUserId(123L);
    }

    @Test
    @WithMockUser(username = "123", roles = "STUDENT")
    void deleteTranscript_Success() throws Exception {
        doNothing().when(transcriptService).deleteTranscript(123L);

        mockMvc.perform(delete("/transcripts/delete")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Transcript deleted successfully"));

        verify(transcriptService).deleteTranscript(123L);
    }

    @Test
    @WithMockUser(username = "123", roles = "STUDENT")
    void deleteTranscript_Error() throws Exception {
        doThrow(new RuntimeException("Deletion failed")).when(transcriptService).deleteTranscript(123L);

        // Exception will be handled by GlobalExceptionHandler, returning 500
        mockMvc.perform(delete("/transcripts/delete")
                .with(csrf()))
                .andExpect(status().isInternalServerError());

        verify(transcriptService).deleteTranscript(123L);
    }

    // Unauthenticated tests
    @Test
    void uploadTranscript_Unauthenticated() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "test-transcript.pdf", 
            "application/pdf", 
            "PDF content".getBytes()
        );

        mockMvc.perform(multipart("/transcripts/upload")
                .file(file)
                .with(csrf()))
                .andExpect(status().isUnauthorized());

        verify(transcriptService, never()).uploadTranscript(anyLong(), any(MultipartFile.class));
    }

    @Test
    void getTranscriptStatus_Unauthenticated() throws Exception {
        mockMvc.perform(get("/transcripts/status"))
                .andExpect(status().isUnauthorized());

        verify(transcriptService, never()).getTranscriptStatus(anyLong());
    }

    @Test
    void downloadMyTranscript_Unauthenticated() throws Exception {
        mockMvc.perform(get("/transcripts/download"))
                .andExpect(status().isUnauthorized());

        verify(transcriptService, never()).getTranscriptByUserId(anyLong());
    }

    @Test
    void deleteTranscript_Unauthenticated() throws Exception {
        mockMvc.perform(delete("/transcripts/delete")
                .with(csrf()))
                .andExpect(status().isUnauthorized());

        verify(transcriptService, never()).deleteTranscript(anyLong());
    }
}
