package com.infinity.courseservice;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.utility.SectionMapper;

class SectionMapperTest {

    private SectionMapper sectionMapper;

    @BeforeEach
    void setUp() {
        sectionMapper = new SectionMapper();
    }

    @Test
    void sectionToDto_mapsSectionCorrectly() {
        Course course = new Course();
        course.setId(1L);
        course.setDeptCode("COSC");
        course.setName("Capstone");
        course.setCourseNum("499");

        Section section = new Section();
        section.setId(1001L);
        section.setYear(2025);
        section.setSemester("W1");
        section.setSection("001");
        section.setType(SectionType.LECTURE);
        section.setCourse(course);

        SectionDto dto = sectionMapper.sectionToDto(section);

        assertEquals(section.getId(), dto.id());
        assertEquals(section.getYear(), dto.year());
        assertEquals(section.getSemester(), dto.semester());
        assertEquals(section.getSection(), dto.section());
        assertEquals(section.getType(), dto.type());

        CourseDto courseDto = dto.course();
        assertEquals(course.getId(), courseDto.id());
        assertEquals(course.getDeptCode(), courseDto.deptCode());
        assertEquals(course.getName(), courseDto.name());
        assertEquals(course.getCourseNum(), courseDto.courseNum());
    }
}
