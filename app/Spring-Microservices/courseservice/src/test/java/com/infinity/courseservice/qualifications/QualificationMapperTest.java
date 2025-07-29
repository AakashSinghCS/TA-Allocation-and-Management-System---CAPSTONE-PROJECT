package com.infinity.courseservice.qualifications;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.QualificationDtos.QualificationDto;
import com.infinity.courseservice.dtos.QualificationDtos.QualificationWithSectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoNoCourse;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Qualification;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.utility.QualificationMapper;
import com.infinity.courseservice.utility.SectionMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class QualificationMapperTest {

    private SectionMapper sectionMapper;
    private QualificationMapper qualificationMapper;

    @BeforeEach
    void setUp() {
        sectionMapper = mock(SectionMapper.class);
        qualificationMapper = new QualificationMapper(sectionMapper);
    }

    @Test
    void toDto_mapsQualificationAndCourseCorrectly() {
        Qualification qualification = new Qualification();
        qualification.setId(1L);
        qualification.setDescription("Strong background in algorithms");

        CourseDto courseDto = new CourseDto(10L, "COSC", "Capstone", "499");

        QualificationDto result = qualificationMapper.toDto(qualification, courseDto);

        assertEquals(1L, result.id());
        assertEquals("Strong background in algorithms", result.description());
        assertEquals(courseDto, result.course());
    }

    @Test
    void toQualificationWithSectionDto_mapsAllFieldsCorrectly() {
        Course course = new Course();
        course.setId(10L);

        Semester semester = new Semester(2025, "W1", null, null);

        Section section = new Section();
        section.setId(20L);
        section.setSection("001");
        section.setType(SectionType.LECTURE);
        section.setCourse(course);
        section.setSemester(semester);

        Qualification qualification = new Qualification();
        qualification.setId(30L);
        qualification.setDeptCode("COSC");
        qualification.setDescription("TA'd this course before");

        var dummySectionDto = new SectionDtoNoCourse(
                20L, 2025, "W1", "001", SectionType.LECTURE, 1);

        when(sectionMapper.sectionToDtoNoCourse(section)).thenReturn(dummySectionDto);

        QualificationWithSectionDto result = qualificationMapper.toQualificationWithSectionDto(section, qualification);

        assertEquals(10L, result.courseId());
        assertEquals(20L, result.sectionDto().id());
        assertEquals(30L, result.qualificationId());
        assertEquals("COSC", result.courseDeptCode());
        assertEquals("TA'd this course before", result.qualificationDescription());
    }
}
