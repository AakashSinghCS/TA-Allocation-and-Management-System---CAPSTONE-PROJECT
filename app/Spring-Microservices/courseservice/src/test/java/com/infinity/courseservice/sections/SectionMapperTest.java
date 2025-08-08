package com.infinity.courseservice.sections;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.SectionDtos.ExportedSectionData;
import com.infinity.courseservice.dtos.SectionDtos.SectionCsvData;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoNoCourse;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoWithInstructorId;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.SectionSchedule;
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.utility.CourseMapper;
import com.infinity.courseservice.utility.SectionMapper;

class SectionMapperTest {

    private SectionMapper sectionMapper;
    private CourseMapper courseMapper;

    @BeforeEach
    void setUp() {
        courseMapper = new CourseMapper();
        sectionMapper = new SectionMapper(courseMapper);
    }

    private Course setupCourse() {
        Course course = new Course();
        course.setId(1L);
        course.setDeptCode("COSC");
        course.setName("Capstone");
        course.setCourseNum("499");
        return course;
    }

    private Semester setupSemester() {
        return new Semester(2025, "W1", null, null, true);
    }

    private Section setupSection() {
        Section section = new Section();
        section.setId(1001L);
        section.setInstructorId(222L);
        section.setSemester(setupSemester());
        section.setSection("001");
        section.setType(SectionType.LECTURE);
        section.setCourse(setupCourse());
        return section;
    }

    @Test
    void sectionToDto_mapsSectionCorrectly() {
        Section section = setupSection();

        SectionDto dto = sectionMapper.sectionToDto(section);

        assertEquals(section.getId(), dto.id());
        assertEquals(section.getSemester().getYear(), dto.year());
        assertEquals(section.getSemester().getSemester(), dto.semester());
        assertEquals(section.getSection(), dto.section());
        assertEquals(section.getType(), dto.type());

        CourseDto courseDto = dto.course();
        assertEquals(section.getCourse().getId(), courseDto.id());
        assertEquals(section.getCourse().getDeptCode(), courseDto.deptCode());
        assertEquals(section.getCourse().getName(), courseDto.name());
        assertEquals(section.getCourse().getCourseNum(), courseDto.courseNum());
    }

    @Test
    void sectionToDtoNoCourse_mapsCorrectly() {
        Section section = setupSection();

        SectionDtoNoCourse dto = sectionMapper.sectionToDtoNoCourse(section);

        assertEquals(section.getId(), dto.id());
        assertEquals(section.getSemester().getYear(), dto.year());
        assertEquals(section.getSemester().getSemester(), dto.semester());
        assertEquals(section.getSection(), dto.section());
        assertEquals(section.getType(), dto.type());
    }

    @Test
    void sectionDtoWithInstructorId_mapsCorrectly() {
        Section section = setupSection();

        SectionDtoWithInstructorId dto = sectionMapper.sectionDtoWithInstructorId(section);

        assertEquals(section.getId(), dto.id());
        assertEquals(section.getInstructorId(), dto.instructorId());
        assertEquals(section.getSemester().getYear(), dto.year());
        assertEquals(section.getSemester().getSemester(), dto.semester());
        assertEquals(section.getSection(), dto.section());
        assertEquals(section.getType(), dto.type());

        CourseDto courseDto = dto.course();
        assertEquals(section.getCourse().getId(), courseDto.id());
        assertEquals(section.getCourse().getDeptCode(), courseDto.deptCode());
        assertEquals(section.getCourse().getName(), courseDto.name());
        assertEquals(section.getCourse().getCourseNum(), courseDto.courseNum());
    }

    @Test
    void exportedSectionData_mapsCorrectly() {
        Section section = setupSection();

        ExportedSectionData data = sectionMapper.exportedSectionData(section);

        assertEquals(section.getId(), data.sectionId());
        assertEquals(section.getSemester().getYear(), data.year());
        assertEquals(section.getSemester().getSemester(), data.semester());
        assertEquals(section.getSection(), data.sectionCode());
        assertEquals(section.getType().toString(), data.type());
        assertEquals(section.getCourse().getId(), data.courseId());
        assertEquals(section.getCourse().getDeptCode(), data.deptCode());
        assertEquals(section.getCourse().getCourseNum(), data.courseNum());
        assertEquals(section.getCourse().getName(), data.courseName());
    }

    @Test
    void sectionCsvData_mapsCorrectly_withSchedule() {
        Section section = setupSection();

        SectionSchedule schedule = new SectionSchedule();
        schedule.setDay("Tuesday");
        schedule.setStartTime(LocalTime.of(10, 0));
        schedule.setEndTime(LocalTime.of(11, 30));

        SectionCsvData csv = sectionMapper.sectionCsvData(section, schedule);

        assertEquals("COSC", csv.deptCode());
        assertEquals("499", csv.courseNum());
        assertEquals("Capstone", csv.name());
        assertEquals(2025, csv.year());
        assertEquals("W1", csv.semester());
        assertEquals("001", csv.section());
        assertEquals("LECTURE", csv.type());
        assertEquals("Tuesday", csv.day());
        assertEquals("10:00", csv.startTime());
        assertEquals("11:30", csv.endTime());
    }

    @Test
    void sectionCsvData_mapsCorrectly_withNullSchedule() {
        Section section = setupSection();

        SectionCsvData csv = sectionMapper.sectionCsvData(section, null);

        assertEquals("COSC", csv.deptCode());
        assertEquals("499", csv.courseNum());
        assertEquals("Capstone", csv.name());
        assertEquals(2025, csv.year());
        assertEquals("W1", csv.semester());
        assertEquals("001", csv.section());
        assertEquals("LECTURE", csv.type());
        assertEquals("", csv.day());
        assertEquals("", csv.startTime());
        assertEquals("", csv.endTime());
    }
}
