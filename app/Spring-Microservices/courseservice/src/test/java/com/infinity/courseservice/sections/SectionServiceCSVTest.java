package com.infinity.courseservice.sections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
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
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.SectionScheduleRepository;
import com.infinity.courseservice.services.SectionService;
import com.infinity.courseservice.utility.SectionMapper;

@ExtendWith(MockitoExtension.class)
class SectionServiceCSVTest {

    @Mock
    private SectionRepository sectionRepository;

    @Mock 
    private SectionScheduleRepository sectionScheduleRepository;

    @Mock
    private SectionMapper sectionMapper;

    @InjectMocks
    private SectionService sectionService;

    private List<Section> mockSections;
    private Course mockCourse;
    private Semester mockSemester;
    private ExportedSectionData mockSectionData1;

    @BeforeEach
    void setUp() {
        mockCourse = new Course();
        mockCourse.setId(1L);
        mockCourse.setDeptCode("COSC");
        mockCourse.setCourseNum("111");
        mockCourse.setName("Intro Programming");
        mockSemester = new Semester(2025, "W1", null, null);

        Section section1 = new Section();
        section1.setId(1L);
        section1.setSemester(mockSemester);
        section1.setSection("001");
        section1.setType(SectionType.LECTURE);
        section1.setCourse(mockCourse);

        Section section2 = new Section();
        section2.setId(2L);
        section2.setSemester(mockSemester);
        section2.setSection("002");
        section2.setType(SectionType.TUTORIAL);
        section2.setCourse(mockCourse);

        mockSectionData1 = new ExportedSectionData(section1.getId(),
                section1.getSemester().getYear(),
                section1.getSemester().getSemester(),
                section1.getSection(),
                section1.getType().toString(),
                section1.getCourse().getId(),
                section1.getCourse().getDeptCode(),
                section1.getCourse().getCourseNum(),
                section1.getCourse().getName(),
                null,
                null,
                null,
                null,
                null,
                null,               
                null,
                null,
                null,
                null);

        mockSections = Arrays.asList(section1, section2);
    }

    @Test
    void testExportSections_Success() {
        // Arrange
        List<Long> sectionIds = Arrays.asList(1L, 2L);
        when(sectionRepository.findAllById(anyList())).thenReturn(mockSections);
        when(sectionMapper.exportedSectionData(any())).thenReturn(mockSectionData1);

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
        when(sectionMapper.exportedSectionData(any())).thenReturn(mockSectionData1);

        // Act
        List<ExportedSectionData> result = sectionService.exportSections(sectionIds);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("001", result.get(0).sectionCode());
    }
}
