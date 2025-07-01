package com.infinity.courseservice;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.SectionDtos.AssignInstructorRequest;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.UserDtos.InstructorDto;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.SectionSchedule;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.SectionScheduleRepository;
import com.infinity.courseservice.services.SectionService;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
public class SectionServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private SectionRepository sectionRepository;

    @Mock
    private SectionScheduleRepository sectionScheduleRepository;

    @Mock
    private UserInterface userInterface;

    @InjectMocks
    private SectionService sectionService;

    @Test
    void testAddSectionSuccess() {
        Course course = new Course("COSC", "Software Engineering", "310");
        course.setId(1L);

        CourseRequest request = new CourseRequest("COSC", "Test", "123", "001",
                SectionType.LECTURE, 2025, "W1", null, null, null, null);
        Section section = new Section(2025, "W1", "001", SectionType.LECTURE, course, null);
        section.setId(10L);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(sectionRepository.save(any(Section.class))).thenReturn(section);

        var result = sectionService.addSection(1L, request);

        assertEquals("001", result.section());
        assertEquals("W1", result.semester());
    }

    @Test
    void testAddSection_CourseNotFound() {
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        CourseRequest request = new CourseRequest("COSC", "Test", "123", "001",
                SectionType.LECTURE, 2025, "W1", null, null, null, null);
        assertThrows(EntityNotFoundException.class, () -> sectionService.addSection(99L, request));
    }

    @Test
    void testAddSection_Duplicate() {
        CourseRequest request = new CourseRequest("COSC", "Test", "123", "001",
                SectionType.LECTURE, 2025, "W1", null, null, null,null);
        Course course = new Course("COSC", "Test", "123");
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(sectionRepository.save(any(Section.class)))
                .thenThrow(new DataIntegrityViolationException("Duplicate entry"));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> sectionService.addSection(1L, request));

        assertEquals("Section already exists org.springframework.dao.DataIntegrityViolationException: Duplicate entry",
                ex.getMessage());
    }

    @Test
    void testAddSectionScheduleSuccess() {
        Course course = new Course("COSC", "AI", "310");
        Section section = new Section(2025, "W1", "001", SectionType.LECTURE, course, null);
        section.setId(20L);

        CourseRequest req = new CourseRequest(null, null, null, null, null, null, null, "Tue", "10:00", "11:00",null);
        SectionSchedule schedule = new SectionSchedule("Tue", LocalTime.of(10, 0), LocalTime.of(11, 0), section);

        when(sectionRepository.findById(20L)).thenReturn(Optional.of(section));
        when(sectionScheduleRepository.save(any())).thenReturn(schedule);

        var result = sectionService.addSectionSchedule(20L, req);

        assertEquals("Tue", result.day());
        assertEquals(LocalTime.of(10, 0), result.startTime());
        assertEquals(20L, result.sectionId());
    }

    @Test
    void testAddSectionSchedule_SectionNotFound() {
        CourseRequest req = new CourseRequest(null, null, null, null, null, null, null, "Tue", "10:00", "11:00",null);

        when(sectionRepository.findById(100L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> sectionService.addSectionSchedule(100L, req));
    }

    @Test
    void testAddSectionSchedule_Duplicate() {
        Course course = new Course("COSC", "AI", "310");
        Section section = new Section(2025, "W1", "001", SectionType.LECTURE, course,null);

        CourseRequest req = new CourseRequest(null, null, null, null, null, null, null, "Tue", "10:00", "11:00",null);

        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));
        doThrow(new DataIntegrityViolationException("Duplicate entry"))
                .when(sectionScheduleRepository).save(any(SectionSchedule.class));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> sectionService.addSectionSchedule(1L, req));

        assertTrue(ex.getMessage().startsWith("Schedule already exists"));
    }

    @Test
    void testGetSectionById_Success() {
        Course course = new Course("COSC", "DB Systems", "304");
        Section section = new Section(2025, "W1", "001", SectionType.LECTURE, course,null);
        section.setId(55L);

        when(sectionRepository.findById(55L)).thenReturn(Optional.of(section));

        SectionDto result = sectionService.getSectionById(55L);
        assertEquals("001", result.section());
        assertEquals("COSC", result.course().deptCode());
    }

    @Test
    void testGetSectionById_NotFound() {
        when(sectionRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> sectionService.getSectionById(99L));
    }

    @Test
    void testAssignInstructor_Success() {
        AssignInstructorRequest request = new AssignInstructorRequest(99L, 101L); // instructorId, sectionId

        InstructorDto instructorDto = new InstructorDto(99L, "Jane", "Doe", 1234, "COSC", null);
        Course course = new Course("COSC", "AI", "310");
        Section section = new Section(2025, "W1", "001", SectionType.LECTURE, course,null);
        section.setId(101L);

        when(userInterface.getInstructorById(99L)).thenReturn(instructorDto);
        when(sectionRepository.findById(101L)).thenReturn(Optional.of(section));
        when(sectionRepository.save(any())).thenReturn(section);

        String result = sectionService.assignInstructor(request);
        assertEquals("Instructor assigned to section 101", result);
        assertEquals(99L, section.getInstructorId());
    }

    @Test
    void testAssignInstructor_SectionNotFound() {
        AssignInstructorRequest request = new AssignInstructorRequest(99L, 101L);
        InstructorDto instructorDto = new InstructorDto(99L, "Jane", "Doe", 1234, "COSC", null);

        when(userInterface.getInstructorById(99L)).thenReturn(instructorDto);
        when(sectionRepository.findById(101L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> sectionService.assignInstructor(request));
    }

    @Test
    void testUnassignInstructor_Success() {
        Course course = new Course("COSC", "AI", "310");
        Section section = new Section(2025, "W1", "001", SectionType.LECTURE, course,null);
        section.setId(101L);
        section.setInstructorId(99L);

        when(sectionRepository.findById(101L)).thenReturn(Optional.of(section));
        when(sectionRepository.save(any())).thenReturn(section);

        String result = sectionService.unassignInstructor(101L, 99L);
        assertEquals("Instructor unassigned from 101", result);
        assertEquals(null, section.getInstructorId());
    }

    @Test
    void testUnassignInstructor_SectionNotFound() {
        when(sectionRepository.findById(101L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> sectionService.unassignInstructor(101L, 99L));
    }

    @Test
    void testGetInstructorSections_Success() {
        Course course1 = new Course("COSC", "Security", "430");
        course1.setId(1L);
        Course course2 = new Course("COSC", "AI", "310");
        course2.setId(2L);

        Section s1 = new Section(2025, "W1", "001", SectionType.LECTURE, course1,null);
        s1.setId(10L);
        Section s2 = new Section(2025, "W1", "002", SectionType.LAB, course2,null);
        s2.setId(11L);

        List<Section> sections = List.of(s1, s2);
        when(sectionRepository.findAllByInstructorId(99L)).thenReturn(sections);

        var result = sectionService.getInstructorSections(99L);

        assertEquals(2, result.size());
        assertEquals("Security", result.get(0).course().name());
        assertEquals("AI", result.get(1).course().name());
    }

}
