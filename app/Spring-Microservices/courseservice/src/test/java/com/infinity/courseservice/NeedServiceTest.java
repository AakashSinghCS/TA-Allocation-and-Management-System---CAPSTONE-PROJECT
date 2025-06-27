package com.infinity.courseservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedRequest;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.CourseNeed;
import com.infinity.courseservice.models.Need;
import com.infinity.courseservice.repositories.CourseNeedRepository;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.NeedRepository;
import com.infinity.courseservice.services.NeedService;

@ExtendWith(MockitoExtension.class)
public class NeedServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private NeedRepository needRepository;

    @Mock
    private CourseNeedRepository courseNeedRepository;

    @InjectMocks
    private NeedService needService;

    private Course mockCourse;
    private Need mockNeed;
    private CourseNeed mockCourseNeed;

    @BeforeEach
    void setUp() {
        mockCourse = new Course("COSC", "Intro to AI", "310");
        mockCourse.setId(1L);

        mockNeed = new Need("Marking Labs", 30, 10);
        mockNeed.setId(5L);

        mockCourseNeed = new CourseNeed(mockCourse, mockNeed, 2025, "W1");
    }

    @Test
    void testAddNeed_Success() {
        NeedRequest request = new NeedRequest("Marking Labs", 30, 10, 2025, "W1");

        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(courseNeedRepository.existsByCourseAndYearAndSemester(mockCourse, 2025, "W1")).thenReturn(false);
        when(needRepository.save(any(Need.class))).thenReturn(mockNeed);

        NeedDto result = needService.addNeed(request, 1L);

        assertNotNull(result);
        assertEquals("Marking Labs", result.description());
        assertEquals(2025, result.year());
        assertEquals("W1", result.semester());
        verify(courseNeedRepository).save(any(CourseNeed.class));
    }

    @Test
    void testAddNeed_DuplicateThrowsBadRequest() {
        NeedRequest request = new NeedRequest("Marking Labs", 30, 10, 2025, "W1");

        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(courseNeedRepository.existsByCourseAndYearAndSemester(mockCourse, 2025, "W1")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> needService.addNeed(request, 1L));
        verify(needRepository, never()).save(any());
    }

    @Test
    void testAddNeed_CourseNotFound() {
        NeedRequest request = new NeedRequest("Marking Labs", 30, 10, 2025, "W1");

        when(courseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> needService.addNeed(request, 1L));
    }

    @Test
    void testGetNeed_Success() {
        when(courseNeedRepository.findByCourseIdAndYearAndSemester(1L, 2025, "W1"))
                .thenReturn(Optional.of(mockCourseNeed));

        NeedDto result = needService.getNeed(1L, 2025, "W1");

        assertEquals("Marking Labs", result.description());
        assertEquals(30, result.requiredGradingHours());
    }

    @Test
    void testGetNeed_NotFound() {
        when(courseNeedRepository.findByCourseIdAndYearAndSemester(1L, 2025, "W1")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> needService.getNeed(1L, 2025, "W1"));
    }

    @Test
    void testUpdateNeed_Success() {
        NeedRequest request = new NeedRequest("Updated", 40, 20, 2025, "W2");

        when(courseNeedRepository.findByCourseIdAndYearAndSemester(1L, 2025, "W1"))
                .thenReturn(Optional.of(mockCourseNeed));
        when(needRepository.save(any())).thenReturn(mockNeed);
        when(courseNeedRepository.save(any())).thenReturn(mockCourseNeed);

        NeedDto result = needService.updateNeed(request, 1L, 2025, "W1");

        assertEquals("Updated", result.description());
        assertEquals(40, result.requiredGradingHours());
        assertEquals("W2", result.semester());
    }

    @Test
    void testUpdateNeed_NotFound() {
        NeedRequest request = new NeedRequest("Updated", 40, 20, 2025, "W1");

        when(courseNeedRepository.findByCourseIdAndYearAndSemester(1L, 2025, "W1")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> needService.updateNeed(request, 1L, 2025, "W1"));
    }

    @Test
    void testDeleteNeed_Success() {
        when(courseNeedRepository.findByCourseIdAndYearAndSemester(1L, 2025, "W1"))
                .thenReturn(Optional.of(mockCourseNeed));

        String result = needService.deleteNeed(1L, 2025, "W1");

        assertEquals("Need deleted", result);
        verify(needRepository).delete(mockNeed);
    }

    @Test
    void testDeleteNeed_NotFound() {
        when(courseNeedRepository.findByCourseIdAndYearAndSemester(1L, 2025, "W1")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> needService.deleteNeed(1L, 2025, "W1"));
    }
}
