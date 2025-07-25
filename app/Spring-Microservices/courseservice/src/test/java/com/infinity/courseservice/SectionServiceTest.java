package com.infinity.courseservice;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.mockito.Mockito;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;

import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.SectionDtos.AssignInstructorRequest;
import com.infinity.courseservice.dtos.SectionDtos.SectionAddDtoRequest;
import com.infinity.courseservice.dtos.SectionDtos.SectionCsvData;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDtoWithInstructorId;
import com.infinity.courseservice.dtos.SectionDtos.SectionScheduleDto;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.enums.UserRole;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.ApplicationInterface;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.SectionSchedule;
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.SectionScheduleRepository;
import com.infinity.courseservice.repositories.SemesterRepository;
import com.infinity.courseservice.services.EnrollmentService;
import com.infinity.courseservice.services.SectionService;
import com.infinity.courseservice.utility.SectionMapper;
import com.infinity.courseservice.utility.SemesterMapper;

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

    @Mock
    private ApplicationInterface applicationInterface;

    @Mock
    private SemesterMapper semesterMapper;

    @Mock
    private SectionMapper sectionMapper;

    @Mock
    private SemesterRepository semesterRepository;

    @InjectMocks
    private SectionService sectionService;

    @Mock
    private EnrollmentService enrollmentService;

    private Course course;
    private CourseDto courseDto;
    private SectionAddDtoRequest request;
    private Section section;
    private Semester semester;
    private SectionDto sectionDto;

    @BeforeEach
    void setUp() {
        course = new Course("COSC", "Software Engineering", "310");
        course.setId(1L);
        request = new SectionAddDtoRequest("COSC", "Test", "123", "001", SectionType.LECTURE, 2025, "W1", null, null);
        semester = new Semester(2025, "W1", null, null);
        section = new Section(semester, "001", SectionType.LECTURE, course, null);
        section.setId(10L);
        courseDto = new CourseDto(1L, "COSC", "Software Engineering", "310");
        sectionDto = new SectionDto(1L, 2025, "W1", "001", SectionType.LECTURE, courseDto, 1);
    }

    @Test
    void testAddSectionSuccess() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(sectionRepository.save(any(Section.class))).thenReturn(section);
        when(sectionMapper.sectionToDto(any())).thenReturn(sectionDto);
        when(semesterRepository.findByYearAndSemester(any(), any())).thenReturn(Optional.of(semester));

        var result = sectionService.addSection(1L, request);

        assertEquals("001", result.section());
        assertEquals("W1", result.semester());
    }

    @Test
    void testAddSection_CourseNotFound() {
        when(courseRepository.findById(99L)).thenReturn(Optional.empty());

        SectionAddDtoRequest request = new SectionAddDtoRequest("COSC", "Test", "123", "001",
                SectionType.LECTURE, 2025, "W1", null, null);
        assertThrows(NotFoundException.class, () -> sectionService.addSection(99L, request));
    }

    @Test
    void testAddSection_Duplicate() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(sectionRepository.save(any(Section.class)))
                .thenThrow(new DataIntegrityViolationException("Duplicate entry"));
        when(semesterRepository.findByYearAndSemester(any(), any())).thenReturn(Optional.of(semester));
        BadRequestException ex = assertThrows(BadRequestException.class, () -> sectionService.addSection(1L, request));

        assertEquals("Section already exists org.springframework.dao.DataIntegrityViolationException: Duplicate entry",
                ex.getMessage());
    }

    @Test
    void testUpdateSectionNotFound() {
        CourseRequest request = new CourseRequest("COSC", "Test", "123", "001",
                SectionType.LECTURE, 2025, "W1", null, null, null, null);
        when(sectionRepository.findById(1L)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class, () -> sectionService.updateSection(1L, request));

        assertEquals("No section with id 1", ex.getMessage());
    }

    @Test

    void testUpdateSectionSuccess() {
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));
        when(semesterRepository.findByYearAndSemester(any(), any())).thenReturn(Optional.of(semester));
        when(sectionMapper.sectionToDto(any())).thenReturn(sectionDto);

        CourseRequest request = new CourseRequest("COSC", "Test", "123", "001",
                SectionType.LECTURE, 2025, "W1", null, null, null, null);
        SectionDto dto = sectionService.updateSection(1L, request);

        assertEquals(SectionType.LECTURE, dto.type());
        assertEquals(2025, dto.year());
        assertEquals("W1", dto.semester());
    }

    @Test
    void testDeleteSectionNotFound() {
        when(sectionRepository.existsById(1L)).thenReturn(false);

        NotFoundException ex = assertThrows(NotFoundException.class, () -> sectionService.deleteSection(1L));

        assertEquals("No section with id 1", ex.getMessage());
    }

    @Test
    void testDeleteSectionSuccess() {
        when(sectionRepository.existsById(1L)).thenReturn(true);
        when(applicationInterface.setSectionIdNull(1L))
                .thenReturn(ResponseEntity.ok(3));
        when(enrollmentService.clearSectionFromStudentCourses(1L))
                .thenReturn(5);

        String response = sectionService.deleteSection(1L);

        assertEquals("Section deleted. 3 allocations cleared. 5 enrollments affected.", response);
    }

    @Test
    void testAddSectionScheduleSuccess() {
        CourseRequest req = new CourseRequest(null, null, null, null, null, null, null, "Tue", "10:00", "11:00", null);
        SectionSchedule schedule = new SectionSchedule("Tue", LocalTime.of(10, 0), LocalTime.of(11, 0), section);

        when(sectionRepository.findById(20L)).thenReturn(Optional.of(section));
        when(sectionScheduleRepository.save(any())).thenReturn(schedule);

        var result = sectionService.addSectionSchedule(20L, req);

        assertEquals("Tue", result.day());
        assertEquals(LocalTime.of(10, 0), result.startTime());
        assertEquals(10L, result.sectionId());
    }

    @Test
    void testAddSectionSchedule_SectionNotFound() {
        CourseRequest req = new CourseRequest(null, null, null, null, null, null, null, "Tue", "10:00", "11:00", null);

        when(sectionRepository.findById(100L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> sectionService.addSectionSchedule(100L, req));
    }

    @Test
    void testAddSectionSchedule_Duplicate() {
        CourseRequest req = new CourseRequest(null, null, null, null, null, null, null, "Tue", "10:00", "11:00", null);

        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));
        doThrow(new DataIntegrityViolationException("Duplicate entry"))
                .when(sectionScheduleRepository).save(any(SectionSchedule.class));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> sectionService.addSectionSchedule(1L, req));

        assertTrue(ex.getMessage().startsWith("Schedule already exists"));
    }

    @Test
    void testUpdateSectionScheduleNotFound() {
        CourseRequest req = new CourseRequest(null, null, null, null, null, null, null, "Tue", "10:00", "11:00", null);
        when(sectionScheduleRepository.findById(1L)).thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(NotFoundException.class,
                () -> sectionService.updateSectionSchedule(1L, req));

        assertEquals("No schedule with id 1", ex.getMessage());
    }

    @Test
    void testUpdateSectionScheduleSuccess() {
        SectionSchedule schedule = new SectionSchedule("Tue", LocalTime.of(10, 0), LocalTime.of(11, 0), section);

        CourseRequest req = new CourseRequest(null, null, null, null, null, null, null, "Tue", "10:00", "11:00", null);
        when(sectionScheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));
        SectionScheduleDto dto = sectionService.updateSectionSchedule(1L, req);

        assertEquals("Tue", dto.day());
        assertEquals(LocalTime.parse("10:00"), dto.startTime());
        assertEquals(LocalTime.parse("11:00"), dto.endTime());
    }

    @Test
    void testDeleteSectionScheduleNotFound() {
        when(sectionScheduleRepository.existsById(1L)).thenReturn(false);

        NotFoundException ex = assertThrows(NotFoundException.class, () -> sectionService.deleteSectionSchedule(1L));

        assertEquals("No schedule with id 1", ex.getMessage());
    }

    @Test
    void testDeleteSectionScheduleSuccess() {
        when(sectionScheduleRepository.existsById(1L)).thenReturn(true);
        String response = sectionService.deleteSectionSchedule(1L);

        assertEquals("Section schedule deleted", response);
    }

    @Test
    void testGetSectionById_Success() {
        when(sectionRepository.findById(55L)).thenReturn(Optional.of(section));
        when(sectionMapper.sectionToDto(any())).thenReturn(sectionDto);

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
    void testGetSectionSchedules_NotFound() {
        when(sectionRepository.findById(any())).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> sectionService.getSectionSchedules(99L));
    }

    @Test
    void testGetSectionSchedules_Success() {
        SectionSchedule schedule = new SectionSchedule("Tue", LocalTime.of(10, 0), LocalTime.of(11, 0), section);
        section.setSectionSchedules(List.of(schedule));
        when(sectionRepository.findById(any())).thenReturn(Optional.of(section));
        List<SectionScheduleDto> scheduleDtos = sectionService.getSectionSchedules(1L);
        assertEquals("Tue", scheduleDtos.get(0).day());
        assertEquals(LocalTime.parse("10:00"), scheduleDtos.get(0).startTime());
        assertEquals(LocalTime.parse("11:00"), scheduleDtos.get(0).endTime());
    }

    @Test
    void testAssignInstructor_Success() {
        AssignInstructorRequest request = new AssignInstructorRequest(99L, 101L);

        UserDto instructorDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.INSTRUCTOR), null,
                null, null, null, 12345678, "COSC", null, false);
        section.setId(101L);

        when(userInterface.getInstructorById(99L)).thenReturn(instructorDto);
        when(sectionRepository.findById(101L)).thenReturn(Optional.of(section));
        when(sectionRepository.save(any())).thenReturn(section);

        String result = sectionService.assignInstructor(request);
        assertEquals("Instructor assigned to section 101", result);
        assertEquals(2L, section.getInstructorId());
    }

    @Test
    void testAssignInstructor_SectionNotFound() {
        AssignInstructorRequest request = new AssignInstructorRequest(99L, 101L);
        UserDto instructorDto = new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.INSTRUCTOR), null,
                null, null, null, 12345678, "COSC", null, false);

        when(userInterface.getInstructorById(99L)).thenReturn(instructorDto);
        when(sectionRepository.findById(101L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> sectionService.assignInstructor(request));
    }

    @Test
    void testUnassignInstructor_Success() {
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
        CourseDto courseDto1 = new CourseDto(2L, "COSC", "Security", "430");
        CourseDto courseDto2 = new CourseDto(3L, "COSC", "AI", "310");

        Section s1 = new Section(semester, "001", SectionType.LECTURE, course1, null);
        s1.setId(10L);
        Section s2 = new Section(semester, "002", SectionType.LABORATORY, course2, null);
        s2.setId(11L);
        SectionDto sectionDto1 = new SectionDto(1L, 2025, "W1", "001", SectionType.LECTURE, courseDto1, 1);
        SectionDto sectionDto2 = new SectionDto(1L, 2025, "W1", "001", SectionType.LECTURE, courseDto2, 1);

        List<Section> sections = List.of(s1, s2);
        when(sectionRepository.findAllByInstructorId(99L)).thenReturn(sections);
        when(sectionMapper.sectionToDto(s1)).thenReturn(sectionDto1);
        when(sectionMapper.sectionToDto(s2)).thenReturn(sectionDto2);

        var result = sectionService.getInstructorSections(99L);

        assertEquals(2, result.size());
        assertEquals("Security", result.get(0).course().name());
        assertEquals("AI", result.get(1).course().name());
    }

    @Test
    void add_WithNewCourseAndSchedule_ReturnsTrue() {
        // Arrange
        SectionAddDtoRequest req = new SectionAddDtoRequest(
                "COSC", // deptCode
                "Intro to CS", // name
                "111", // courseNum
                "001", // section
                SectionType.LECTURE, // type
                2024, // year
                "W1", // semester
                List.of(new SectionScheduleDto(
                        "Monday",
                        LocalTime.of(8, 0),
                        LocalTime.of(9, 30),
                        null, // sectionId
                        2L)),
                42L // instructorId
        );

        // No existing course
        when(courseRepository.findByDeptCodeAndCourseNum("COSC", "111"))
                .thenReturn(Optional.empty());
        // Saving a new course
        Course savedCourse = new Course("COSC", "Intro to CS", "111");
        savedCourse.setId(1L);
        when(courseRepository.save(any(Course.class))).thenReturn(savedCourse);

        // Saving section
        Section savedSection = new Section(
                semester,
                "001",
                SectionType.LECTURE,
                42L,
                savedCourse);
        savedSection.setId(2L);
        when(sectionRepository.save(any(Section.class))).thenReturn(savedSection);
        when(semesterRepository.findByYearAndSemester(any(), any())).thenReturn(Optional.of(semester));

        // Act
        boolean result = sectionService.add(req);

        // Assert
        assertTrue(result);
        verify(courseRepository).save(any(Course.class));
        verify(sectionRepository).save(any(Section.class));
        verify(sectionScheduleRepository).save(any(SectionSchedule.class));
    }

    @Test
    void add_WithBlankDeptOrCourseNum_ThrowsBadRequest() {
        // Arrange: blank deptCode/courseNum
        SectionAddDtoRequest req = new SectionAddDtoRequest(
                "   ", // deptCode blank
                null,
                "   ", // courseNum blank
                null,
                null,
                null,
                null,
                null,
                null);

        // Act & Assert
        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> sectionService.add(req));
        assertTrue(ex.getMessage().contains("Both deptCode and courseNum are required"));
    }

    @Test
    void testGetSectionWithInstructorIdById_Success() {
        section.setId(55L);
        SectionDtoWithInstructorId mappedDto = new SectionDtoWithInstructorId(1L, 1L, 2025, "W1", "001",
                SectionType.LECTURE, courseDto, 1);

        when(sectionRepository.findById(55L)).thenReturn(Optional.of(section));
        when(sectionMapper.sectionDtoWithInstructorId(any())).thenReturn(mappedDto);

        SectionDtoWithInstructorId result = sectionService.getSectionWithInstructorIdById(55L);
        assertEquals("COSC", result.course().deptCode());
        assertEquals(1L, result.instructorId());
    }

    @Test
    void testGetSectionWithInstructorIdById_NotFound() {
        when(sectionRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> sectionService.getSectionWithInstructorIdById(99L));
    }

    // --- CSV Import/Export tests ---
    @Test
    void importSectionsFromJson_success() {
        var data = new SectionCsvData(
                "COSC", "111", "Intro to CS", 2025, "Winter", "001", "LECTURE", "Mon", "09:00", "10:00");
        Course course = new Course("COSC", "Intro to CS", "111");
        when(courseRepository.findByDeptCodeAndCourseNum("COSC", "111")).thenReturn(Optional.of(course));
        when(sectionRepository.findByCourseAndSemester_YearAndSemester_SemesterAndSectionAndType(course, 2025, "Winter", "001",
                SectionType.LECTURE)).thenReturn(Optional.empty());
        when(semesterRepository.findByYearAndSemester(any(), any())).thenReturn(Optional.of(semester));
        when(sectionRepository.save(any())).thenReturn(Mockito.mock(Section.class));
        String result = sectionService.importSectionsFromJson(List.of(data));
        assertTrue(result.contains("Success: 1"));
        assertFalse(result.contains("Errors: 1"));
    }

    @Test
    void importSectionsFromJson_missingRequiredFields() {
        var data = new SectionCsvData("", "", "", null, "", "", "", "", "",
                "");
        String result = sectionService.importSectionsFromJson(List.of(data));
        assertTrue(result.contains("Errors: 1"));
        assertTrue(result.contains("Missing required fields"));
    }

    @Test
    void importSectionsFromJson_invalidType() {
        var data = new SectionCsvData("COSC", "111", "Intro to CS", 2025,
                "Winter", "001", "INVALID", "Mon", "09:00", "10:00");
        Course course = new Course("COSC", "Intro to CS", "111");
        when(courseRepository.findByDeptCodeAndCourseNum("COSC", "111")).thenReturn(Optional.of(course));
        String result = sectionService.importSectionsFromJson(List.of(data));
        assertTrue(result.contains("Errors: 1"));
        assertTrue(result.contains("Invalid section type"));
    }

    @Test
    void importSectionsFromJson_invalidSemester() {
        var data = new SectionCsvData("COSC", "111", "Intro to CS", 2025,
                "Winter", "001", "LECTURE", "Mon", "invalid", "invalid");
        Course course = new Course("COSC", "Intro to CS", "111");
        when(courseRepository.findByDeptCodeAndCourseNum("COSC", "111")).thenReturn(Optional.of(course));
        when(sectionRepository.findByCourseAndSemester_YearAndSemester_SemesterAndSectionAndType(course, 2025, "Winter",
                "001",
                SectionType.LECTURE)).thenReturn(Optional.empty());
        when(semesterRepository.findByYearAndSemester(any(), any())).thenReturn(Optional.empty());
        String result = sectionService.importSectionsFromJson(List.of(data));
        assertTrue(result.contains("Errors: 1"));
        assertTrue(result.contains("That semester doesn't exist"));
    }

    @Test
    void importSectionsFromJson_invalidTimeFormat() {
        var data = new SectionCsvData("COSC", "111", "Intro to CS", 2025,
                "Winter", "001", "LECTURE", "Mon", "invalid", "invalid");
        Course course = new Course("COSC", "Intro to CS", "111");
        when(courseRepository.findByDeptCodeAndCourseNum("COSC", "111")).thenReturn(Optional.of(course));
        when(sectionRepository.findByCourseAndSemester_YearAndSemester_SemesterAndSectionAndType(course, 2025, "Winter", "001",
                SectionType.LECTURE)).thenReturn(Optional.empty());
        when(semesterRepository.findByYearAndSemester(any(), any())).thenReturn(Optional.of(semester));
        String result = sectionService.importSectionsFromJson(List.of(data));
        assertTrue(result.contains("Errors: 1"));
        assertTrue(result.contains("Invalid time format"));
    }
}
