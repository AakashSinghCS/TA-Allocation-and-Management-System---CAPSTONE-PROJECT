package com.infinity.courseservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;

import com.infinity.courseservice.dtos.AllocationDtos.AllocationHistoryDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.UserDtos.StudentDto;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.ApplicationInterface;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.SectionSchedule;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.SectionScheduleRepository;
import com.infinity.courseservice.services.CourseService;
import com.infinity.courseservice.services.NeedService;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
public class CourseServiceTest {
    
    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserInterface userInterface;

    @Mock
    private SectionRepository sectionRepository;

    @Mock
    private SectionScheduleRepository sectionScheduleRepository;

    @Mock
    private NeedService needService;

    @Mock
    private ApplicationInterface applicationInterface;

    @InjectMocks
    private CourseService courseService;

    @Test
    void testAddCourse_Duplicate() {
        CourseRequest request = new CourseRequest("COSC", "Distributed Systems", "455", null, null, null, null, null,
                null);

        when(courseRepository.save(any(Course.class)))
            .thenThrow(new DataIntegrityViolationException("Duplicate entry"));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> courseService.addCourse(request));

        assertEquals("Course already exists org.springframework.dao.DataIntegrityViolationException: Duplicate entry", ex.getMessage());
    }

    @Test
    void testAddCourse() {
        CourseRequest request = new CourseRequest("COSC", "Distributed Systems", "455", null, null, null, null, null, null);
        Course savedCourse = new Course("COSC", "Distributed Systems", "455");

        when(courseRepository.save(any(Course.class))).thenReturn(savedCourse);

        CourseDto dto = courseService.addCourse(request);

        assertEquals("COSC", dto.deptCode());
        assertEquals("Distributed Systems", dto.name());
        assertEquals("455", dto.courseNum());
    }

    @Test
    void testFindCourseSuccess() {
        Course course = new Course("COSC", "Distributed Systems", "455");
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));

        CourseDto dto = courseService.findCourse(1L);

        assertEquals("COSC", dto.deptCode());
        assertEquals("Distributed Systems", dto.name());
        assertEquals("455", dto.courseNum());
    }

    @Test
    void testFindCourseNotFound() {
        when(courseRepository.findById(1L)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class, () -> courseService.findCourse(1L));
        assertEquals("Course with ID 1 not found", ex.getMessage());
    }

    @Test
    void testFindCoursesByIds() {
        Course course1 = new Course("COSC", "Distributed Systems", "455");
        Course course2 = new Course("COSC", "Operating Systems", "315");

        List<Course> courses = Arrays.asList(course1, course2);
        when(courseRepository.findAllById(Arrays.asList(1L, 2L))).thenReturn(courses);

        List<CourseDto> result = courseService.findCoursesByIds(Arrays.asList(1L, 2L));

        assertEquals(2, result.size());
        assertEquals("Distributed Systems", result.get(0).name());
        assertEquals("Operating Systems", result.get(1).name());
    }

    @Test
    void testFilterCourses() {
        CourseSectionScheduleDto dto1 = new CourseSectionScheduleDto("COSC", "Distributed Systems", "455", "001", "L",
                SectionType.LAB, "Wed", LocalTime.of(14, 00), LocalTime.of(15, 30));
        CourseSectionScheduleDto dto2 = new CourseSectionScheduleDto("COSC", "Operating Systems", "S", "002", "2025W2",
                SectionType.LAB, "Wed", LocalTime.of(14, 00), LocalTime.of(15, 30));

        CourseFilterRequest filterRequest = new CourseFilterRequest("COSC", null, null, null, "2025W1", null, "Wed",
                LocalTime.of(14, 00), LocalTime.of(15, 30));
        when(courseRepository.courseFilter("COSC", null, null, null, "2025W1", null, "Wed", LocalTime.of(14, 00),
                LocalTime.of(15, 30)))
                .thenReturn(List.of(dto1, dto2));

        List<CourseSectionScheduleDto> result = courseService.filterCourses(filterRequest);
        assertEquals(2, result.size());
        assertEquals("Distributed Systems", result.get(0).name());
        assertEquals(LocalTime.of(14, 00), result.get(0).startTime());
    }
    
    @Test
    void testAddSectionSuccess() {
        Course course = new Course("COSC", "Software Engineering", "310");
        course.setId(1L);

        CourseRequest request = new CourseRequest("COSC", "Software Engineering", "310", "LEC", SectionType.LECTURE, "2025W1", null,
                null, null);
        Section section = new Section("2025W1", "001", SectionType.LECTURE, course);
        section.setId(10L);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(sectionRepository.save(any(Section.class))).thenReturn(section);

        var result = courseService.addSection(1L, request);

        assertEquals("LEC", result.section());
        assertEquals("2025W1", result.term());
    }

    @Test
    void testAddSection_CourseNotFound() {
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        CourseRequest request = new CourseRequest("COSC", "Test", "123", "2025W1",
                SectionType.LECTURE, "LEC", null, null, null);
        assertThrows(EntityNotFoundException.class, () -> courseService.addSection(99L, request));
    }
    
    @Test
    void testAddSection_Duplicate() {
        CourseRequest request = new CourseRequest("COSC", "Test", "123", "2025W1",
                SectionType.LECTURE, "LEC", null, null, null);
        Course course = new Course("COSC", "Test", "123");
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(sectionRepository.save(any(Section.class)))
                .thenThrow(new DataIntegrityViolationException("Duplicate entry"));
        
        BadRequestException ex = assertThrows(BadRequestException.class, () -> courseService.addSection(1L, request));

        assertEquals("Section already exists org.springframework.dao.DataIntegrityViolationException: Duplicate entry",
                ex.getMessage());
    }

    @Test
    void testAddSectionScheduleSuccess() {
        Course course = new Course("COSC", "AI", "310");
        Section section = new Section("2025W1", "001", SectionType.LECTURE, course);
        section.setId(20L);

        CourseRequest req = new CourseRequest(null, null, null, null, null, null, "Tue", "10:00", "11:00");
        SectionSchedule schedule = new SectionSchedule("Tue", LocalTime.of(10, 0), LocalTime.of(11, 0), section);

        when(sectionRepository.findById(20L)).thenReturn(Optional.of(section));
        when(sectionScheduleRepository.save(any())).thenReturn(schedule);

        var result = courseService.addSectionSchedule(20L, req);

        assertEquals("Tue", result.day());
        assertEquals(LocalTime.of(10, 0), result.startTime());
        assertEquals(20L, result.sectionId());
    }

    @Test
    void testAddSectionSchedule_SectionNotFound() {
        CourseRequest req = new CourseRequest(null, null, null, null, null, null, "Tue", "10:00", "11:00");

        when(sectionRepository.findById(100L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> courseService.addSectionSchedule(100L, req));
    }

    @Test
    void testAddSectionSchedule_Duplicate() {
        Course course = new Course("COSC", "AI", "310");
        Section section = new Section("2025W1", "001", SectionType.LECTURE, course);

        CourseRequest req = new CourseRequest(null, null, null, null, null, null, "Tue", "10:00", "11:00");

        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));
        doThrow(new DataIntegrityViolationException("Duplicate entry"))
                .when(sectionScheduleRepository).save(any(SectionSchedule.class));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> courseService.addSectionSchedule(1L, req));

        assertTrue(ex.getMessage().startsWith("Schedule already exists"));
    }

    @Test
    void testGetSectionById_Success() {
        Course course = new Course("COSC", "DB Systems", "304");
        Section section = new Section("2025W1", "001", SectionType.LECTURE, course);
        section.setId(55L);

        when(sectionRepository.findById(55L)).thenReturn(Optional.of(section));

        SectionDto result = courseService.getSectionById(55L);
        assertEquals("001", result.section());
        assertEquals("COSC", result.course().deptCode());
    }

    @Test
    void testGetSectionById_NotFound() {
        when(sectionRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> courseService.getSectionById(99L));
    }

    @Test
    void testGetCourseNeedsAndAllocations_Success() {
        Course course = new Course("COSC", "Security", "430");
        course.setId(50L);

        List<NeedDto> needs = List.of(new NeedDto(1L, "Lab Hours", 20, 5));
        List<AllocationHistoryDto> allocations = List.of(
            new AllocationHistoryDto(1L, new StudentDto(1L, "John", "Doe", null, null, null, null), null, true, 10, null));

        when(courseRepository.findById(50L)).thenReturn(Optional.of(course));
        when(needService.getAllNeedsByCourseId(50L)).thenReturn(needs);
        when(applicationInterface.getStudentAllocationHistory(50L)).thenReturn(ResponseEntity.ok(allocations));

        var result = courseService.getCourseNeedsAndAllocations(50L);

        assertEquals("Security", result.course().name());
        assertEquals(1, result.needs().size());
        assertEquals("John", result.allocations().get(0).student().firstName());
    }

    @Test
    void testGetCourseNeedsAndAllocations_CourseNotFound() {
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> courseService.getCourseNeedsAndAllocations(99L));
    }
}
