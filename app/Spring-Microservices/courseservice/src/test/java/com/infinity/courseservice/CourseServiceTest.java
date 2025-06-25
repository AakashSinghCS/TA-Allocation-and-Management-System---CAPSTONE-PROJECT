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

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto;
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

    // @Test
    // void testGetCourseNeedsAndAllocations_Success() {
    //     Course course = new Course("COSC", "Security", "430");
    //     course.setId(50L);

    //     List<NeedDto> needs = List.of(new NeedDto(1L, "Lab Hours", 20, 5));
    //     List<AllocationHistoryDto> allocations = List.of(
    //         new AllocationHistoryDto(1L, new StudentDto(1L, "John", "Doe", null, null, null, null), null, true, 10, null));

    //     when(courseRepository.findById(50L)).thenReturn(Optional.of(course));
    //     when(needService.getAllNeedsByCourseId(50L)).thenReturn(needs);
    //     when(applicationInterface.getStudentAllocationHistory(50L)).thenReturn(ResponseEntity.ok(allocations));

    //     var result = courseService.getCourseNeedsAndAllocations(50L);

    //     assertEquals("Security", result.course().name());
    //     assertEquals(1, result.needs().size());
    //     assertEquals("John", result.allocations().get(0).student().firstName());
    // }

    // @Test
    // void testGetCourseNeedsAndAllocations_CourseNotFound() {
    //     when(courseRepository.findById(99L)).thenReturn(Optional.empty());
    //     assertThrows(NotFoundException.class, () -> courseService.getCourseNeedsAndAllocations(99L));
    // }
}
