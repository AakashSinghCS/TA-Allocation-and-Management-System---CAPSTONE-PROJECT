package com.infinity.courseservice;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infinity.courseservice.dtos.CourseDto;
import com.infinity.courseservice.dtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseSectionScheduleDto;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.services.CourseService;


@ExtendWith(MockitoExtension.class)
public class CourseServiceTest {
    
    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserInterface userInterface;

    @InjectMocks
    private CourseService courseService;

    @Test
    void testAddCourse() {
        CourseRequest request = new CourseRequest("COSC", "Distributed Systems", 455, null, null, null, null, null, null);
        Course savedCourse = new Course("COSC", "Distributed Systems", 455);

        when(courseRepository.save(any(Course.class))).thenReturn(savedCourse);

        CourseDto dto = courseService.addCourse(request);

        assertEquals("COSC", dto.deptCode());
        assertEquals("Distributed Systems", dto.name());
        assertEquals(455, dto.courseNum());
    }

    @Test
    void testFindCourseSuccess() {
        Course course = new Course("COSC", "Distributed Systems", 455);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));

        CourseDto dto = courseService.findCourse(1L);

        assertEquals("COSC", dto.deptCode());
        assertEquals("Distributed Systems", dto.name());
        assertEquals(455, dto.courseNum());
    }

    @Test
    void testFindCourseNotFound() {
        when(courseRepository.findById(1L)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class, () -> courseService.findCourse(1L));
        assertEquals("Course with ID 1 not found", ex.getMessage());
    }

    @Test
    void testFindCoursesByIds() {
        Course course1 = new Course("COSC", "Distributed Systems", 455);
        Course course2 = new Course("COSC", "Operating Systems", 315);

        List<Course> courses = Arrays.asList(course1, course2);
        when(courseRepository.findAllById(Arrays.asList(1L, 2L))).thenReturn(courses);

        List<CourseDto> result = courseService.findCoursesByIds(Arrays.asList(1L, 2L));

        assertEquals(2, result.size());
        assertEquals("Distributed Systems", result.get(0).name());
        assertEquals("Operating Systems", result.get(1).name());
    }

    @Test
    void testFilterCourses() {
        CourseSectionScheduleDto dto1 = new CourseSectionScheduleDto("COSC", "Distributed Systems", 455, "001","L", "2025W1", "Wed", LocalTime.of(14, 00), LocalTime.of(15, 30));
        CourseSectionScheduleDto dto2 = new CourseSectionScheduleDto("COSC", "Operating Systems", 315, "002", "2025W2","L", "Wed", LocalTime.of(14, 00), LocalTime.of(15, 30));

        CourseFilterRequest filterRequest = new CourseFilterRequest("COSC", null, null, null, "2025W1",null, "Wed", LocalTime.of(14, 00), LocalTime.of(15, 30));
        when(courseRepository.courseFilter("COSC", null, null, null, "2025W1", null, "Wed", LocalTime.of(14, 00), LocalTime.of(15, 30)))
            .thenReturn(List.of(dto1, dto2));

        List<CourseSectionScheduleDto> result = courseService.filterCourses(filterRequest);
        assertEquals(2, result.size());
        assertEquals("Distributed Systems", result.get(0).name());
        assertEquals(LocalTime.of(14, 00), result.get(0).startTime());
    }
}
