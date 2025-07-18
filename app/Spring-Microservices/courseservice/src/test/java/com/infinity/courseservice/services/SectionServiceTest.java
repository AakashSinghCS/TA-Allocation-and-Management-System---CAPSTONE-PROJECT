package com.infinity.courseservice.services;

import com.infinity.courseservice.dtos.SectionDtos.SectionCsvData;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.SectionScheduleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SectionServiceTest {
    @Mock
    private SectionRepository sectionRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private SectionScheduleRepository sectionScheduleRepository;
    @InjectMocks
    private SectionService sectionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void importSectionsFromJson_success() {
        SectionCsvData data = new SectionCsvData(
                "COSC", "111", "Intro to CS", 2025, "Winter", "001", "LECTURE", "Mon", "09:00", "10:00"
        );
        Course course = new Course("COSC", "Intro to CS", "111");
        when(courseRepository.findByDeptCodeAndCourseNum("COSC", "111")).thenReturn(Optional.of(course));
        when(sectionRepository.findByCourseAndYearAndSemesterAndSectionAndType(course, 2025, "Winter", "001", SectionType.LECTURE)).thenReturn(Optional.empty());
        when(courseRepository.save(any())).thenReturn(course);
        when(sectionRepository.save(any())).thenReturn(mock(Section.class));
        String result = sectionService.importSectionsFromJson(List.of(data));
        assertTrue(result.contains("Success: 1"));
        assertFalse(result.contains("Errors: 1"));
    }

    @Test
    void importSectionsFromJson_missingRequiredFields() {
        SectionCsvData data = new SectionCsvData("", "", "", null, "", "", "", "", "", "");
        String result = sectionService.importSectionsFromJson(List.of(data));
        assertTrue(result.contains("Errors: 1"));
        assertTrue(result.contains("Missing required fields"));
    }

    @Test
    void importSectionsFromJson_invalidType() {
        SectionCsvData data = new SectionCsvData("COSC", "111", "Intro to CS", 2025, "Winter", "001", "INVALID", "Mon", "09:00", "10:00");
        Course course = new Course("COSC", "Intro to CS", "111");
        when(courseRepository.findByDeptCodeAndCourseNum("COSC", "111")).thenReturn(Optional.of(course));
        String result = sectionService.importSectionsFromJson(List.of(data));
        assertTrue(result.contains("Errors: 1"));
        assertTrue(result.contains("Invalid section type"));
    }

    @Test
    void importSectionsFromJson_invalidTimeFormat() {
        SectionCsvData data = new SectionCsvData("COSC", "111", "Intro to CS", 2025, "Winter", "001", "LECTURE", "Mon", "invalid", "invalid");
        Course course = new Course("COSC", "Intro to CS", "111");
        when(courseRepository.findByDeptCodeAndCourseNum("COSC", "111")).thenReturn(Optional.of(course));
        when(sectionRepository.findByCourseAndYearAndSemesterAndSectionAndType(course, 2025, "Winter", "001", SectionType.LECTURE)).thenReturn(Optional.empty());
        String result = sectionService.importSectionsFromJson(List.of(data));
        assertTrue(result.contains("Errors: 1"));
        assertTrue(result.contains("Invalid time format"));
    }
}
