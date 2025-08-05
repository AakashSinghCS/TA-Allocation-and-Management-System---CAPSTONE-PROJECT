package com.infinity.profileservice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.infinity.profileservice.controllers.TranscriptController;
import com.infinity.profileservice.dto.TranscriptInfoDTO;
import com.infinity.profileservice.dto.TranscriptStatusDTO;
import com.infinity.profileservice.models.Transcript;
import com.infinity.profileservice.services.TranscriptService;

@WebMvcTest(TranscriptController.class)
class TranscriptControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
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

        when(transcriptService.uploadTranscript(eq(123L), any())).thenReturn(mockTranscript);

        mockMvc.perform(multipart("/transcripts/upload")
                .file(file)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().string("Transcript uploaded successfully with ID: 1"));

        verify(transcriptService).uploadTranscript(eq(123L), any());
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

        when(transcriptService.uploadTranscript(eq(123L), any()))
            .thenThrow(new RuntimeException("Only PDF files are allowed"));

        mockMvc.perform(multipart("/transcripts/upload")
                .file(file)
                .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Only PDF files are allowed"));

        verify(transcriptService).uploadTranscript(eq(123L), any());
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

        when(transcriptService.uploadTranscript(eq(123L), any()))
            .thenThrow(new IOException("File processing error"));

        mockMvc.perform(multipart("/transcripts/upload")
                .file(file)
                .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("File processing error"));

        verify(transcriptService).uploadTranscript(eq(123L), any());
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
    @WithMockUser(username = "123", roles = "COORDINATOR")
    void getAllTranscripts_Success() throws Exception {
        Long userIdFromHeader = 1L;
        List<String> userRoles = List.of("ROLE_ADMIN");
        TranscriptInfoDTO transcriptInfo1 = new TranscriptInfoDTO(1L, 123L, "John Doe", "john@test.com", "12345", "transcript1.pdf", "2024-01-15", 1024L);
        TranscriptInfoDTO transcriptInfo2 = new TranscriptInfoDTO(2L, 124L, "Jane Smith", "jane@test.com", "12346", "transcript2.pdf", "2024-01-16", 2048L);
        List<TranscriptInfoDTO> transcripts = Arrays.asList(transcriptInfo1, transcriptInfo2);
        
        when(transcriptService.getAllTranscriptInfo(any(), any())).thenReturn(transcripts);

        mockMvc.perform(get("/transcripts/list")
                .header("X-User-Roles", userRoles)
                .header("X-User-Id",userIdFromHeader))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].studentName").value("John Doe"))
                .andExpect(jsonPath("$[1].studentName").value("Jane Smith"));

        verify(transcriptService).getAllTranscriptInfo(any(), any());
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
    @WithMockUser(username = "123", roles = "COORDINATOR")
    void downloadTranscript_Success() throws Exception {
        when(transcriptService.getTranscriptById(1L)).thenReturn(Optional.of(mockTranscript));

        mockMvc.perform(get("/transcripts/download/1"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"test-transcript.pdf\""))
                .andExpect(content().bytes(mockTranscript.getData()));

        verify(transcriptService).getTranscriptById(1L);
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

        mockMvc.perform(delete("/transcripts/delete")
                .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Deletion failed"));

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

        verify(transcriptService, never()).uploadTranscript(anyLong(), any());
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
