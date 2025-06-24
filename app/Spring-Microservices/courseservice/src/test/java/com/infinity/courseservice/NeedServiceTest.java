package com.infinity.courseservice;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedRequest;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.CourseNeed;
import com.infinity.courseservice.models.Need;
import com.infinity.courseservice.repositories.CourseNeedRepository;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.NeedRepository;
import com.infinity.courseservice.services.NeedService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;

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

    @BeforeEach
    void setUp() {
        mockCourse = new Course("COSC", "Intro to AI", "310");
        mockCourse.setId(1L);

        mockNeed = new Need("Marking Labs", 30, 10);
        mockNeed.setId(5L);
    }

    @Test
    void testAddNeed_Success() {
        NeedRequest request = new NeedRequest("Marking Labs", 30, 10, 2025, "Fall");

        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(needRepository.save(any(Need.class))).thenReturn(mockNeed);

        NeedDto result = needService.addNeed(request, 1L);

        assertNotNull(result);
        assertEquals("Marking Labs", result.description());
        verify(courseNeedRepository).save(any(CourseNeed.class));
    }

    @Test
    void testAddNeed_CourseNotFound() {
        NeedRequest request = new NeedRequest("Marking Labs", 30, 10, 2025, "Fall");

        when(courseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> {
            needService.addNeed(request, 1L);
        });

        verify(needRepository, never()).save(any());
    }

    @Test
    void testGetNeed_Success() {
        when(needRepository.findById(5L)).thenReturn(Optional.of(mockNeed));

        NeedDto result = needService.getNeed(5L);

        assertEquals("Marking Labs", result.description());
        assertEquals(30, result.requiredGradingHours());
    }

    @Test
    void testGetNeed_NotFound() {
        when(needRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> needService.getNeed(99L));
    }

    @Test
    void testUpdateNeed_Success() {
        NeedRequest update = new NeedRequest("Updated", 40, 20, 2025, "Fall");

        when(needRepository.findById(5L)).thenReturn(Optional.of(mockNeed));
        when(needRepository.save(any())).thenReturn(mockNeed);

        NeedDto result = needService.updateNeed(update, 5L);

        assertEquals("Updated", result.description());
        assertEquals(40, result.requiredGradingHours());
    }

    @Test
    void testUpdateNeed_NotFound() {
        NeedRequest update = new NeedRequest("Updated", 40, 20, 2025, "Fall");

        when(needRepository.findById(5L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> needService.updateNeed(update, 5L));
    }

    @Test
    void testDeleteNeed_Success() {
        when(needRepository.existsById(5L)).thenReturn(true);

        String result = needService.deleteNeed(5L);

        assertEquals("Need deleted", result);
        verify(needRepository).deleteById(5L);
    }

    @Test
    void testDeleteNeed_NotFound() {
        when(needRepository.existsById(5L)).thenReturn(false);

        assertThrows(NotFoundException.class, () -> needService.deleteNeed(5L));
    }

    @Test
    void testGetAllNeedsByCourseId_Success() {
        CourseNeed cn = new CourseNeed(mockCourse, mockNeed, 2025, "Fall");

        when(courseRepository.existsById(1L)).thenReturn(true);
        when(courseNeedRepository.findByCourseId(1L)).thenReturn(List.of(cn));

        List<NeedDto> result = needService.getAllNeedsByCourseId(1L);

        assertEquals(1, result.size());
        assertEquals("Marking Labs", result.get(0).description());
    }

    @Test
    void testGetAllNeedsByCourseId_CourseNotFound() {
        when(courseRepository.existsById(1L)).thenReturn(false);

        assertThrows(NotFoundException.class, () -> needService.getAllNeedsByCourseId(1L));
    }
}
