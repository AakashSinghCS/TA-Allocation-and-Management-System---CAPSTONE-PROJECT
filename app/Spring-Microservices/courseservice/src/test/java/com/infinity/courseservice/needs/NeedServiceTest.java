package com.infinity.courseservice.needs;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.DeadlineDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedRequest;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.ApplicationInterface;
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

    @Mock
    private ApplicationInterface applicationInterface;

    private Course mockCourse;
    private Need mockNeed;
    private CourseNeed mockCourseNeed;

    @BeforeEach
    void mockDeadline() {
        DeadlineDto dto = new DeadlineDto(
            "student_application_deadline",
            LocalDateTime.now().minusDays(1),
            LocalDateTime.now().plusDays(1)
        );
        ResponseEntity<DeadlineDto> responseEntity = ResponseEntity.ok(dto);

        lenient().when(applicationInterface.getDeadlineByName(anyString()))
            .thenReturn(responseEntity);
    }

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
    void testAddNeed_DeadlinePassed_BadRequest() {
        // Arrange
        Long courseId = 1L;

        NeedRequest request = new NeedRequest(
            "Need description",
            5,
            2,
            2025,
            "Spring",
            List.of()
        );

        Course mockCourse = new Course();
        mockCourse.setId(courseId);

        // Mock course repository returning the course
        when(courseRepository.findById(courseId))
            .thenReturn(Optional.of(mockCourse));

        // Mock that no duplicate Need exists
        when(courseNeedRepository.existsByCourseAndYearAndSemester(
            any(Course.class), eq(2025), eq("Spring")))
            .thenReturn(false);

        // Mock expired deadline
        DeadlineDto expiredDeadline = new DeadlineDto(
            "instructor_need_update_deadline",
            LocalDateTime.now().minusDays(2),
            LocalDateTime.now().minusDays(1)
        );

        ResponseEntity<DeadlineDto> responseEntity = ResponseEntity.ok(expiredDeadline);

        when(applicationInterface.getDeadlineByName(anyString()))
            .thenReturn(responseEntity);

        // Act + Assert
        BadRequestException e = assertThrows(BadRequestException.class, () -> {
            needService.addNeed(request, courseId);
        });

        assertEquals("The need update deadline has passed.", e.getMessage());
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
