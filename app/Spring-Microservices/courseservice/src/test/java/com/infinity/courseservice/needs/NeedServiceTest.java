package com.infinity.courseservice.needs;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import com.infinity.courseservice.dtos.DeadlineDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.NeedDtos.NeedRequest;
import com.infinity.courseservice.enums.ActionOptions;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.ApplicationInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.CourseNeed;
import com.infinity.courseservice.models.Need;
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.repositories.CourseNeedRepository;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.NeedRepository;
import com.infinity.courseservice.repositories.PrereqRepository;
import com.infinity.courseservice.repositories.SemesterRepository;
import com.infinity.courseservice.services.AuditService;
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

    @Mock
    private SemesterRepository semesterRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private NeedService needService;

    @Mock
    private ApplicationInterface applicationInterface;

    private Course mockCourse;
    private Need mockNeed;
    private CourseNeed mockCourseNeed;
    private Semester mockSemester;

    @BeforeEach
    void mockDeadline() {
        DeadlineDto dto = new DeadlineDto(
                "student_application_deadline",
                LocalDateTime.now().minusDays(1),
                LocalDateTime.now().plusDays(1));
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
        mockSemester = new Semester(2025, "W1", null, null, true);
        mockCourseNeed = new CourseNeed(mockCourse, mockNeed, mockSemester);
        mockCourseNeed.setId(5L);
    }

    @Test
    void testAddNeed_Success() {
        Long userIdFromHeader = 1L;
        NeedRequest request = new NeedRequest("Marking Labs", 30, 10, 2025, "W1", List.of(1L));
        NeedDto needDto = new NeedDto(5L, 1L, "Marking Labs", 30, 10, 2025, "W1",
                List.of(new CourseDto(1L, "COSC", "Capstone", "499")));

        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(courseNeedRepository.existsByCourseAndSemester(mockCourse, mockSemester)).thenReturn(false);
        when(semesterRepository.findByYearAndSemester(any(), any())).thenReturn(Optional.of(mockSemester));

        when(needRepository.save(any(Need.class)))
                .thenAnswer(invocation -> {
                    Need toSave = invocation.getArgument(0);
                    toSave.setId(mockNeed.getId());
                    return toSave;
                });
        when(courseNeedRepository.save(any(CourseNeed.class)))
                .thenAnswer(invocation -> {
                    CourseNeed toSave = invocation.getArgument(0);
                    toSave.setId(mockCourseNeed.getId());
                    return toSave;
                });

        when(courseRepository.findAllById(request.prerequisiteCourseIds())).thenReturn(List.of(mockCourse));
        when(needMapper.courseNeedToDto(mockCourseNeed)).thenReturn(needDto);

        NeedDto result = needService.addNeed(request, 1L, userIdFromHeader);

        assertNotNull(result);
        assertEquals("Marking Labs", result.description());
        assertEquals(2025, result.year());
        assertEquals("W1", result.semester());
        assertEquals("Capstone", result.prerequisites().get(0).name());
        verify(auditService).record(
                eq(userIdFromHeader),
                eq(ActionOptions.CREATE),
                eq("Need"),
                eq(null),
                eq(mockNeed),
                eq(mockNeed.getId()));
        verify(auditService).record(
                eq(userIdFromHeader),
                eq(ActionOptions.CREATE),
                eq("CourseNeed"),
                eq(null),
                eq(mockCourseNeed),
                eq(mockCourseNeed.getId()));
    }

    @Test
    void testAddNeed_NoSemester_NotFound() {
        Long userIdFromHeader = 1L;
        Long courseId = 1L;
        mockCourse.setId(courseId);
        NeedRequest request = new NeedRequest(
                "Need description",
                5,
                2,
                2025,
                "Spring",
                List.of());

        when(courseRepository.findById(courseId))
                .thenReturn(Optional.of(mockCourse));
        when(semesterRepository.findByYearAndSemester(any(), any())).thenReturn(Optional.empty());
        NotFoundException e = assertThrows(NotFoundException.class, () -> {
            needService.addNeed(request, courseId, userIdFromHeader);
        });
        assertEquals(e.getMessage(), "That semester doesn't exist");
    }

    @Test
    void testAddNeed_DeadlinePassed_BadRequest() {
        Long userIdFromHeader = 1L;
        Long courseId = 1L;

        NeedRequest request = new NeedRequest(
                "Need description",
                5,
                2,
                2025,
                "Spring",
                List.of());

        Course mockCourse = new Course();
        mockCourse.setId(courseId);

        // Mock course repository returning the course
        when(courseRepository.findById(courseId))
                .thenReturn(Optional.of(mockCourse));

        // Mock that no duplicate Need exists
        when(courseNeedRepository.existsByCourseAndSemester(
                any(Course.class), any(Semester.class)))
                .thenReturn(false);
        when(semesterRepository.findByYearAndSemester(any(), any())).thenReturn(Optional.of(mockSemester));

        // Mock expired deadline
        DeadlineDto expiredDeadline = new DeadlineDto(
                "instructor_need_update_deadline",
                LocalDateTime.now().minusDays(2),
                LocalDateTime.now().minusDays(1));

        ResponseEntity<DeadlineDto> responseEntity = ResponseEntity.ok(expiredDeadline);

        when(applicationInterface.getDeadlineByName(anyString()))
                .thenReturn(responseEntity);

        // Act + Assert
        BadRequestException e = assertThrows(BadRequestException.class, () -> {
            needService.addNeed(request, courseId, userIdFromHeader);
        });

        assertEquals("The need update deadline has passed.", e.getMessage());
    }

    @Test
    void testAddNeed_DuplicateThrowsBadRequest() {
        Long userIdFromHeader = 1L;
        NeedRequest request = new NeedRequest("Marking Labs", 30, 10, 2025, "W1", null);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(mockCourse));
        when(courseNeedRepository.existsByCourseAndSemester(mockCourse, mockSemester)).thenReturn(true);
        when(semesterRepository.findByYearAndSemester(any(), any())).thenReturn(Optional.of(mockSemester));

        BadRequestException e = assertThrows(BadRequestException.class,
                () -> needService.addNeed(request, 1L, userIdFromHeader));
        assertEquals(e.getMessage(), "Need already exists for course that year and semester");
        verify(needRepository, never()).save(any());
    }

    @Test
    void testAddNeed_CourseNotFound() {
        Long userIdFromHeader = 1L;
        NeedRequest request = new NeedRequest("Marking Labs", 30, 10, 2025, "W1", null);

        when(courseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> needService.addNeed(request, 1L, userIdFromHeader));
    }

    @Test
    void testGetNeed_Success() {
        when(courseNeedRepository.findByCourseIdAndSemester_YearAndSemester_Semester(1L, 2025, "W1"))
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
        when(courseNeedRepository.findByCourseIdAndSemester_YearAndSemester_Semester(1L, 2025, "W1"))
                .thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> needService.getNeed(1L, 2025, "W1"));
    }

    @Test
    void testUpdateNeed_Success() {
        Long userIdFromHeader = 1L;
        NeedRequest request = new NeedRequest("Updated", 40, 20, 2025, "W2", List.of(2L));
        NeedDto needDto = new NeedDto(5L, 1L, "Updated", 40, 20, 2025, "W2",
                List.of(new CourseDto(2L, "DATA", "Intro to R", "103")));
        Need beforeNeed = new Need(mockNeed);
        CourseNeed beforeCourseNeed = new CourseNeed(mockCourseNeed);
        // doNothing().when(prereqRepository).deleteByCourseNeed(mockCourseNeed);
        when(courseNeedRepository.findByCourseIdAndSemester_YearAndSemester_Semester(1L, 2025, "W1"))
                .thenReturn(Optional.of(mockCourseNeed));
        when(needRepository.save(any(Need.class)))
                .thenAnswer(invocation -> {
                    Need toSave = invocation.getArgument(0);
                    toSave.setId(mockNeed.getId());
                    return toSave;
                });
        when(courseNeedRepository.save(any(CourseNeed.class)))
                .thenAnswer(invocation -> {
                    CourseNeed toSave = invocation.getArgument(0);
                    toSave.setId(mockCourseNeed.getId());
                    return toSave;
                });
        when(needMapper.courseNeedToDto(mockCourseNeed)).thenReturn(needDto);
        when(semesterRepository.findByYearAndSemester(any(), any())).thenReturn(Optional.of(mockSemester));

        NeedDto result = needService.updateNeed(request, 1L, 2025, "W1", userIdFromHeader);

        assertEquals("Updated", result.description());
        assertEquals(40, result.requiredGradingHours());
        assertEquals("W2", result.semester());
        assertEquals(result.prerequisites().get(0).name(), "Intro to R");
        verify(auditService, times(2)).record(
                eq(userIdFromHeader),
                eq(ActionOptions.UPDATE),
                eq("CourseNeed"),
                eq(beforeCourseNeed),
                eq(mockCourseNeed),
                eq(mockCourseNeed.getId()));
        verify(auditService).record(
                eq(userIdFromHeader),
                eq(ActionOptions.UPDATE),
                eq("Need"),
                eq(beforeNeed),
                eq(mockNeed),
                eq(mockNeed.getId()));
    }

    @Test
    void testUpdateNeed_NotFound() {
        Long userIdFromHeader = 1L;
        NeedRequest request = new NeedRequest("Updated", 40, 20, 2025, "W1", null);

        when(courseNeedRepository.findByCourseIdAndSemester_YearAndSemester_Semester(1L, 2025, "W1"))
                .thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> needService.updateNeed(request, 1L, 2025, "W1", userIdFromHeader));
    }

    @Test
    void testDeleteNeed_Success() {
        Long userIdFromHeader = 1L;
        when(courseNeedRepository.findByCourseIdAndSemester_YearAndSemester_Semester(1L, 2025, "W1"))
                .thenReturn(Optional.of(mockCourseNeed));
        mockNeed.setCourseNeeds(new ArrayList<>());
        mockNeed.getCourseNeeds().add(mockCourseNeed);
        String result = needService.deleteNeed(1L, 2025, "W1", userIdFromHeader);

        assertEquals("Need deleted", result);
        verify(needRepository).delete(mockNeed);

        Need expectedSnapshot = new Need(mockNeed);
        verify(auditService).record(
                eq(userIdFromHeader),
                eq(ActionOptions.DELETE),
                eq("Need"),
                eq(expectedSnapshot),
                isNull(),
                eq(expectedSnapshot.getId()));

        // 6) now verify the CourseNeed‐deletion audit actually happened
        verify(auditService).record(
                eq(userIdFromHeader),
                eq(ActionOptions.DELETE),
                eq("CourseNeed"),
                eq(mockCourseNeed),
                isNull(),
                eq(mockCourseNeed.getId()));
    }

    @Test
    void testUpdateAllocatedHours_NotFound() {
        Long userIdFromHeader = 1L;
        when(needRepository.existsById(any())).thenReturn(false);
        assertThrows(NotFoundException.class, () -> needService.updateAllocatedHours(1L, 6, userIdFromHeader));
    }

    @Test
    void testUpdateAllocatedHours_Success() {
        Long userIdFromHeader = 1L;
        when(needRepository.existsById(any())).thenReturn(true);
        String result = needService.updateAllocatedHours(1L, 6, userIdFromHeader);
        assertEquals(result, "Need updated");
        verify(needRepository).updateNeedAllocatedHours(1L, 6);
    }

    @Test
    void testDeleteNeed_NotFound() {
        Long userIdFromHeader = 1L;
        when(courseNeedRepository.findByCourseIdAndSemester_YearAndSemester_Semester(1L, 2025, "W1"))
                .thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> needService.deleteNeed(1L, 2025, "W1", userIdFromHeader));
    }
}
