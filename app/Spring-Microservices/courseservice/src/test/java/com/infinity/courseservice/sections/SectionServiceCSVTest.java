package com.infinity.courseservice.sections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infinity.courseservice.dtos.SectionDtos.ExportedSectionData;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.SectionScheduleRepository;
import com.infinity.courseservice.services.SectionService;

@ExtendWith(MockitoExtension.class)
class SectionServiceCSVTest {

    @Mock
    private SectionRepository sectionRepository;

    @Mock 
    private SectionScheduleRepository sectionScheduleRepository;

    @InjectMocks
    private SectionService sectionService;

    private List<Section> mockSections;
    private Course mockCourse;

    @BeforeEach
    void setUp() {
        mockCourse = new Course();
        mockCourse.setId(1L);
        mockCourse.setDeptCode("COSC");
        mockCourse.setCourseNum("111");
        mockCourse.setName("Intro Programming");

        Section section1 = new Section();
        section1.setId(1L);
        section1.setYear(2025);
        section1.setSemester("W1");
        section1.setSection("001");
        section1.setType(SectionType.LECTURE);
        section1.setCourse(mockCourse);

        Section section2 = new Section();
        section2.setId(2L);
        section2.setYear(2025);
        section2.setSemester("W1");
        section2.setSection("002");
        section2.setType(SectionType.TUTORIAL);
        section2.setCourse(mockCourse);

        mockSections = Arrays.asList(section1, section2);
    }

    @Test
    void testExportSections_Success() {
        // Arrange
        List<Long> sectionIds = Arrays.asList(1L, 2L);
        when(sectionRepository.findAllById(anyList())).thenReturn(mockSections);

        // Act
        List<ExportedSectionData> result = sectionService.exportSections(sectionIds);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        
        ExportedSectionData exported1 = result.get(0);
        assertEquals("COSC", exported1.deptCode());
        assertEquals("111", exported1.courseNum());
        assertEquals("Intro Programming", exported1.courseName());
        assertEquals(2025, exported1.year());
        assertEquals("W1", exported1.semester());
        assertEquals("001", exported1.sectionCode());
        assertEquals("LECTURE", exported1.type());
        
        ExportedSectionData exported2 = result.get(1);
        assertEquals("002", exported2.sectionCode());
        assertEquals("TUTORIAL", exported2.type());
    }

    @Test
    void testExportSections_EmptyList() {
        // Arrange
        List<Long> sectionIds = Arrays.asList();
        when(sectionRepository.findAllById(anyList())).thenReturn(Arrays.asList());

        // Act
        List<ExportedSectionData> result = sectionService.exportSections(sectionIds);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testExportSections_NonExistentIds() {
        // Arrange
        List<Long> sectionIds = Arrays.asList(999L, 998L);
        when(sectionRepository.findAllById(anyList())).thenReturn(Arrays.asList());

        // Act
        List<ExportedSectionData> result = sectionService.exportSections(sectionIds);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void testExportSections_PartialResults() {
        // Arrange - only one section exists
        List<Long> sectionIds = Arrays.asList(1L, 999L);
        when(sectionRepository.findAllById(anyList())).thenReturn(Arrays.asList(mockSections.get(0)));

        // Act
        List<ExportedSectionData> result = sectionService.exportSections(sectionIds);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("001", result.get(0).sectionCode());
    }
}
