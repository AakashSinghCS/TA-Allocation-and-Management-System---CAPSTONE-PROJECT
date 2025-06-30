package com.infinity.courseservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
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
import com.infinity.courseservice.dtos.AllocationDtos.OfferDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseNeedAndAllocations;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoNoCourse;
import com.infinity.courseservice.dtos.UserDtos.StudentDto;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.ApplicationInterface;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.SectionScheduleRepository;
import com.infinity.courseservice.services.CourseService;
import com.infinity.courseservice.services.NeedService;
import com.infinity.courseservice.services.SectionService;

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

    @Mock
    private SectionService sectionService;

    @InjectMocks
    private CourseService courseService;

    @Test
    void testAddCourse_Duplicate() {
        CourseRequest request = new CourseRequest("COSC", "Distributed Systems", "455", null, null, null, null, null,
                null,
                null);

        when(courseRepository.save(any(Course.class)))
                .thenThrow(new DataIntegrityViolationException("Duplicate entry"));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> courseService.addCourse(request));

        assertEquals("Course already exists org.springframework.dao.DataIntegrityViolationException: Duplicate entry",
                ex.getMessage());
    }

    @Test
    void testAddCourse() {
        CourseRequest request = new CourseRequest("COSC", "Distributed Systems", "455", null, null, null, null, null,
                null, null);
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
    void testUpdateCourseNotFound() {
            CourseRequest request = new CourseRequest("COSC", "Capstone", "499", null, null, null, null,
                            null,
                            null, null);
            when(courseRepository.findById(1L)).thenReturn(Optional.empty());

            NotFoundException ex = assertThrows(NotFoundException.class, () -> courseService.updateCourse(request, 1L));

            assertEquals("No course with id 1", ex.getMessage());
    }

    @Test
    void testUpdateCourseSuccess() {
            Course course = new Course("COSC", "Distributed Systems", "455");
            when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
            CourseRequest request = new CourseRequest("DATA", "Capstone", "499", null, null, null, null,
                            null,
                            null, null);
            CourseDto dto = courseService.updateCourse(request, 1L);

            assertEquals("DATA", dto.deptCode());
            assertEquals("Capstone", dto.name());
            assertEquals("499", dto.courseNum());
    }

    @Test
    void testDeleteCourseNotFound() {
            when(courseRepository.existsById(1L)).thenReturn(false);

            NotFoundException ex = assertThrows(NotFoundException.class, () -> courseService.deleteCourse(1L));

            assertEquals("No course with id 1", ex.getMessage());
    }

    @Test
    void testDeleteCourseSuccess() {
            when(courseRepository.existsById(1L)).thenReturn(true);
            String response = courseService.deleteCourse(1L);

            assertEquals("Course deleted", response);
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
        CourseSectionScheduleDto dto1 = new CourseSectionScheduleDto("COSC", "Distributed Systems", "455", "001", 2025,
                "W1",
                SectionType.LAB, "Wed", LocalTime.of(14, 00), LocalTime.of(15, 30));
        CourseSectionScheduleDto dto2 = new CourseSectionScheduleDto("COSC", "Operating Systems", "S", "002", 2025,
                "W2",
                SectionType.LAB, "Wed", LocalTime.of(14, 00), LocalTime.of(15, 30));

        CourseFilterRequest filterRequest = new CourseFilterRequest("COSC", null, null, null, 2025, "W1", null, "Wed",
                LocalTime.of(14, 00), LocalTime.of(15, 30));
        when(courseRepository.courseFilter("COSC", null, null, null, 2025, "W1", null, "Wed", LocalTime.of(14, 00),
                LocalTime.of(15, 30)))
                .thenReturn(List.of(dto1, dto2));

        List<CourseSectionScheduleDto> result = courseService.filterCourses(filterRequest);
        assertEquals(2, result.size());
        assertEquals("Distributed Systems", result.get(0).name());
        assertEquals(LocalTime.of(14, 00), result.get(0).startTime());
    }

    @Test
    void testGetCourseNeedAndAllocations_Success() {
        Long courseId = 1L;
        int year = 2025;
        String semester = "W1";

        Course course = new Course("COSC", "Networks", "329");
        course.setId(courseId);

        NeedDto need = new NeedDto(5L, courseId, "Grading", 30, 15, year, semester);

        AllocationHistoryDto allocation = new AllocationHistoryDto(
                1L,
                new StudentDto(10L, "John", "Smith", 1234, "COSC", 2021, 4),
                new OfferDto(100L, true, "Lab marking"),
                true,
                12,
                new SectionDtoNoCourse(5L, year, semester, "001", SectionType.LECTURE));

        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(needService.getNeed(courseId, year, semester)).thenReturn(need);
        when(applicationInterface.getStudentAllocationHistory(courseId))
                .thenReturn(ResponseEntity.ok(List.of(allocation)));

        CourseNeedAndAllocations result = courseService.getCourseNeedAndAllocations(courseId, year, semester);

        assertEquals("Networks", result.course().name());
        assertEquals("Grading", result.need().description());
        assertEquals(1, result.allocations().size());
        assertEquals("John", result.allocations().get(0).student().firstName());
    }

    @Test
    void testGetCourseNeedAndAllocations_CourseNotFound() {
        when(courseRepository.findById(404L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class,
                () -> courseService.getCourseNeedAndAllocations(404L, 2025, "W1"));
    }

    @Test
    void testGetInstructorCourseNeedsAndAllocations_Success() {
        Long instructorId = 77L;

        SectionDto section1 = new SectionDto(
                10L, 2025, "W1", "001", SectionType.LECTURE,
                new CourseDto(1L, "COSC", "Security", "430"));

        SectionDto section2 = new SectionDto(
                11L, 2025, "W1", "002", SectionType.LAB,
                new CourseDto(1L, "COSC", "Security", "430") // duplicate course-term
        );

        NeedDto need = new NeedDto(10L, 1L, "Labs", 25, 10, 2025, "W1");
        AllocationHistoryDto alloc = new AllocationHistoryDto(
                3L,
                new StudentDto(2L, "Alice", "Wang", 9999, "COSC", 2022, 3),
                new OfferDto(200L, false, "Lab Marking"),
                true,
                8,
                new SectionDtoNoCourse(10L, 2025, "W1", "001", SectionType.LECTURE));

        when(sectionService.getInstructorSections(instructorId)).thenReturn(List.of(section1, section2));
        when(courseRepository.findById(1L)).thenReturn(Optional.of(new Course("COSC", "Security", "430")));
        when(needService.getNeed(1L, 2025, "W1")).thenReturn(need);
        when(applicationInterface.getStudentAllocationHistory(1L)).thenReturn(ResponseEntity.ok(List.of(alloc)));

        List<CourseNeedAndAllocations> result = courseService.getInstructorCourseNeedsAndAllocations(instructorId);

        assertEquals(1, result.size());
        assertEquals("Security", result.get(0).course().name());
        assertEquals("Labs", result.get(0).need().description());
        assertEquals("Alice", result.get(0).allocations().get(0).student().firstName());
    }

    @Test
    void testGetInstructorCourseNeedsAndAllocations_IgnoresMissingNeed() {
        Long instructorId = 77L;

        SectionDto section1 = new SectionDto(
                10L, 2025, "W1", "001", SectionType.LECTURE,
                new CourseDto(1L, "COSC", "Security", "430"));

        when(sectionService.getInstructorSections(instructorId)).thenReturn(List.of(section1));
        when(courseRepository.findById(1L)).thenReturn(Optional.of(new Course("COSC", "Security", "430")));
        when(needService.getNeed(1L, 2025, "W1")).thenThrow(new NotFoundException("Need not found"));

        List<CourseNeedAndAllocations> result = courseService.getInstructorCourseNeedsAndAllocations(instructorId);

        assertEquals(0, result.size()); // gracefully skipped
    }
}
