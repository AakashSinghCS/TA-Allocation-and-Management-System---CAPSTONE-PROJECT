package com.infinity.courseservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
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
import com.infinity.courseservice.repositories.PrereqRepository;
import com.infinity.courseservice.services.NeedService;
import com.infinity.courseservice.utility.NeedMapper;

@ExtendWith(MockitoExtension.class)
public class NeedServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private NeedRepository needRepository;

    @Mock
    private CourseNeedRepository courseNeedRepository;

    @Mock
    private PrereqRepository prereqRepository;

    @Mock
    private NeedMapper needMapper;

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
        NeedRequest request = new NeedRequest("Marking Labs", 30, 10, 2025, "W1", List.of(1L));
        NeedDto needDto = new NeedDto(1L, 1L, "Marking Labs", 30, 10, 2025, "W1", List.of(new CourseDto(1L, "COSC", "Capstone", "499")));

        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(courseNeedRepository.existsByCourseAndYearAndSemester(mockCourse, 2025, "W1")).thenReturn(false);
        when(courseNeedRepository.save(any(CourseNeed.class))).thenReturn(mockCourseNeed);
        when(courseRepository.findAllById(request.prerequisiteCourseIds())).thenReturn(List.of(mockCourse));
        when(needMapper.courseNeedToDto(mockCourseNeed)).thenReturn(needDto);

        NeedDto result = needService.addNeed(request, 1L);

        assertNotNull(result);
        assertEquals("Marking Labs", result.description());
        assertEquals(2025, result.year());
        assertEquals("W1", result.semester());
        assertEquals("Capstone", result.prerequisites().get(0).name());
    }

    @Test
    void testAddNeed_DuplicateThrowsBadRequest() {
        NeedRequest request = new NeedRequest("Marking Labs", 30, 10, 2025, "W1", null);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(courseNeedRepository.existsByCourseAndYearAndSemester(mockCourse, 2025, "W1")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> needService.addNeed(request, 1L));
        verify(needRepository, never()).save(any());
    }

    @Test
    void testAddNeed_CourseNotFound() {
        NeedRequest request = new NeedRequest("Marking Labs", 30, 10, 2025, "W1", null);

        when(courseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> needService.addNeed(request, 1L));
    }

    @Test
    void testGetNeed_Success() {
        when(courseNeedRepository.findByCourseIdAndYearAndSemester(1L, 2025, "W1"))
                .thenReturn(Optional.of(mockCourseNeed));
        NeedDto needDto = new NeedDto(1L, 1L, "Marking Labs", 30, 10, 2025, "W1",
                List.of(new CourseDto(1L, "COSC", "Capstone", "499"))); 
        when(needMapper.courseNeedToDto(mockCourseNeed)).thenReturn(needDto);
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
        NeedRequest request = new NeedRequest("Updated", 40, 20, 2025, "W2", List.of(2L));
        NeedDto needDto = new NeedDto(1L, 1L, "Updated", 40, 20, 2025, "W2",
                List.of(new CourseDto(2L, "DATA", "Intro to R", "103")));
// doNothing().when(prereqRepository).deleteByCourseNeed(mockCourseNeed);
        when(courseNeedRepository.findByCourseIdAndYearAndSemester(1L, 2025, "W1"))
                .thenReturn(Optional.of(mockCourseNeed));
        when(needRepository.save(any())).thenReturn(mockNeed);
        when(courseNeedRepository.save(any())).thenReturn(mockCourseNeed);
        when(needMapper.courseNeedToDto(mockCourseNeed)).thenReturn(needDto);

        NeedDto result = needService.updateNeed(request, 1L, 2025, "W1");

        assertEquals("Updated", result.description());
        assertEquals(40, result.requiredGradingHours());
        assertEquals("W2", result.semester());
        assertEquals(result.prerequisites().get(0).name(), "Intro to R");
    }

    @Test
    void testUpdateNeed_NotFound() {
        NeedRequest request = new NeedRequest("Updated", 40, 20, 2025, "W1", null);

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
