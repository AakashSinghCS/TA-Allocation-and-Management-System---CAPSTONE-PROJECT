package com.infinity.courseservice;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.courseservice.controllers.SectionController;
import com.infinity.courseservice.dtos.SectionDtos.ExportedSectionData;
import com.infinity.courseservice.dtos.SectionDtos.SectionCsvData;
import com.infinity.courseservice.services.SectionService;

@WebMvcTest(SectionController.class)
@AutoConfigureMockMvc(addFilters = false)
public class SectionCSVControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SectionService sectionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "COORDINATOR")
    void testExportSections() throws Exception {
        // Arrange
        List<Long> sectionIds = Arrays.asList(1L, 2L);
        List<ExportedSectionData> mockData = Arrays.asList(
            new ExportedSectionData(
                1L, 2025, "W1", "001", "LECTURE", 
                100L, "COSC", "111", "Intro to Programming",
                null, null, null, null, null, null, null, null, null, null
            ),
            new ExportedSectionData(
                2L, 2025, "W1", "L01", "LABORATORY", 
                100L, "COSC", "111", "Intro to Programming",
                null, null, null, null, null, null, null, null, null, null
            )
        );

        when(sectionService.exportSections(anyList())).thenReturn(mockData);

        String requestJson = "{\"sectionIds\":[1,2]}";

        // Act & Assert
        mockMvc.perform(post("/sections/export")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sectionId").value(1))
                .andExpect(jsonPath("$[0].year").value(2025))
                .andExpect(jsonPath("$[0].semester").value("W1"))
                .andExpect(jsonPath("$[0].sectionCode").value("001"))
                .andExpect(jsonPath("$[0].type").value("LECTURE"))
                .andExpect(jsonPath("$[1].sectionId").value(2))
                .andExpect(jsonPath("$[1].type").value("LABORATORY"));
    }

    @Test
    @WithMockUser(roles = "COORDINATOR")
    @Disabled("Disabled due to missing import functionality")
    void testImportSections() throws Exception {
        // This test is disabled because ImportSectionsBatchResponse and importSections are not implemented
        // TODO: Implement import functionality and re-enable this test
    }

    @Test
    @WithMockUser(roles = "COORDINATOR")
    void testExportSectionsAsCsv() throws Exception {
        // Arrange
        List<Long> sectionIds = Arrays.asList(1L, 2L);
        List<SectionCsvData> mockCsvData = Arrays.asList(
            new SectionCsvData("COSC", "111", "Intro to Programming", 2025, "W1", "001", "LECTURE", "Monday", "14:00", "15:30"),
            new SectionCsvData("COSC", "111", "Intro to Programming", 2025, "W1", "L01", "LABORATORY", "Tuesday", "09:00", "11:30")
        );

        when(sectionService.exportSectionsAsCsv(anyList())).thenReturn(mockCsvData);

        String requestJson = "{\"sectionIds\":[1,2]}";

        // Act & Assert
        mockMvc.perform(post("/sections/export-csv")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].deptCode").value("COSC"))
                .andExpect(jsonPath("$[0].courseNum").value("111"))
                .andExpect(jsonPath("$[0].name").value("Intro to Programming"))
                .andExpect(jsonPath("$[0].year").value(2025))
                .andExpect(jsonPath("$[0].semester").value("W1"))
                .andExpect(jsonPath("$[0].section").value("001"))
                .andExpect(jsonPath("$[0].type").value("LECTURE"))
                .andExpect(jsonPath("$[1].section").value("L01"))
                .andExpect(jsonPath("$[1].type").value("LABORATORY"));
    }

    @Test
    @WithMockUser(roles = "COORDINATOR")
    void testExportAllSectionsAsCsv() throws Exception {
        // Arrange
        List<SectionCsvData> mockCsvData = Arrays.asList(
            new SectionCsvData("COSC", "111", "Intro to Programming", 2025, "W1", "001", "LECTURE", "Monday", "14:00", "15:30"),
            new SectionCsvData("MATH", "200", "Calculus I", 2025, "W1", "001", "LECTURE", "Wednesday", "10:00", "11:30")
        );

        when(sectionService.exportAllSectionsAsCsv()).thenReturn(mockCsvData);

        // Act & Assert
        mockMvc.perform(get("/sections/export-csv/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].deptCode").value("COSC"))
                .andExpect(jsonPath("$[1].deptCode").value("MATH"))
                .andExpect(jsonPath("$[1].courseNum").value("200"));
    }
}
