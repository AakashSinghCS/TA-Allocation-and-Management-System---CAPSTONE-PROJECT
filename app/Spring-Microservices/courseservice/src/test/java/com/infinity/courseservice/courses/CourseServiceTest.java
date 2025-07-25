package com.infinity.courseservice.courses;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;

import com.infinity.courseservice.dtos.AllocationDtos.AllocationHistoryDtoWithCourse;
import com.infinity.courseservice.dtos.AllocationDtos.OfferDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseDto;
import com.infinity.courseservice.dtos.CourseDtos.CourseFilterRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseNeedAndAllocations;
import com.infinity.courseservice.dtos.CourseDtos.CourseRequest;
import com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto;
import com.infinity.courseservice.dtos.CourseDtos.StudentTaughtCourseDto;
import com.infinity.courseservice.dtos.CourseDtos.StudentTaughtCourseRequest;
import com.infinity.courseservice.dtos.NeedDtos.NeedDto;
import com.infinity.courseservice.dtos.SectionDtos.SectionDto;
import com.infinity.courseservice.dtos.UserDtos.UserDto;
import com.infinity.courseservice.enums.ActionOptions;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.enums.Semester;
import com.infinity.courseservice.enums.UserRole;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.feign.ApplicationInterface;
import com.infinity.courseservice.feign.UserInterface;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.StudentTaughtCourse;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.repositories.SectionScheduleRepository;
import com.infinity.courseservice.repositories.StudentTaughtCourseRepository;
import com.infinity.courseservice.services.AuditService;
import com.infinity.courseservice.services.CourseService;
import com.infinity.courseservice.services.NeedService;
import com.infinity.courseservice.services.SectionService;
import com.infinity.courseservice.utility.CourseMapper;
import com.infinity.courseservice.utility.SectionMapper;
import com.infinity.courseservice.utility.StudentTaughtCourseMapper;

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

        @Mock
        private CourseMapper courseMapper;

        @Mock
        private StudentTaughtCourseRepository studentTaughtCourseRepository;

        @Mock
        private SectionMapper sectionMapper;

        @Mock
        private AuditService auditService;

        @Mock
        private StudentTaughtCourseMapper studentTaughtCourseMapper;

        @InjectMocks
        private CourseService courseService;

        @Test
        void testAddCourse_Duplicate() {
                Long userIdFromHeader = 1L;
                CourseRequest request = new CourseRequest("COSC", "Distributed Systems", "455", null, null, null, null,
                                null,
                                null,
                                null, null);

                when(courseRepository.save(any(Course.class)))
                                .thenThrow(new DataIntegrityViolationException("Duplicate entry"));

                BadRequestException ex = assertThrows(BadRequestException.class,
                                () -> courseService.addCourse(request, userIdFromHeader));

                assertEquals("Course already exists org.springframework.dao.DataIntegrityViolationException: Duplicate entry",
                                ex.getMessage());
        }

        @Test
        void testAddCourse() {
                Long userIdFromHeader = 1L;
                CourseRequest request = new CourseRequest("COSC", "Distributed Systems", "455", null, null, null, null,
                                null,
                                null, null, null);
                Course savedCourse = new Course("COSC", "Distributed Systems", "455");
                CourseDto courseDto = new CourseDto(1L, "COSC", "Distributed Systems", "455");

                when(courseRepository.save(any(Course.class))).thenReturn(savedCourse);
                when(courseMapper.courseToDto(savedCourse)).thenReturn(courseDto);

                CourseDto dto = courseService.addCourse(request, userIdFromHeader);

                assertEquals("COSC", dto.deptCode());
                assertEquals("Distributed Systems", dto.name());
                assertEquals("455", dto.courseNum());
                verify(auditService).record(
                                eq(userIdFromHeader),
                                eq(ActionOptions.CREATE),
                                eq("Course"),
                                eq(null),
                                eq(savedCourse),
                                eq(savedCourse.getId()));
        }

        @Test
        void testFindCourseSuccess() {
                Course course = new Course("COSC", "Distributed Systems", "455");
                when(courseRepository.findById(1L)).thenReturn(Optional.of(course));

                CourseDto courseDto = new CourseDto(1L, "COSC", "Distributed Systems", "455");
                when(courseMapper.courseToDto(course)).thenReturn(courseDto);

                CourseDto dto = courseService.findCourse(1L);

                assertEquals("COSC", dto.deptCode());
                assertEquals("Distributed Systems", dto.name());
                assertEquals("455", dto.courseNum());
        }

        @Test
        void testUpdateCourseNotFound() {
                Long userIdFromHeader = 1L;
                CourseRequest request = new CourseRequest("COSC", "Capstone", "499", null, null, null, null,
                                null,
                                null, null, null);
                when(courseRepository.findById(1L)).thenReturn(Optional.empty());

                NotFoundException ex = assertThrows(NotFoundException.class,
                                () -> courseService.updateCourse(request, 1L, userIdFromHeader));

                assertEquals("No course with id 1", ex.getMessage());
        }

        @Test
        void testUpdateCourseSuccess() {
                Long userIdFromHeader = 1L;
                Course course = new Course("COSC", "Distributed Systems", "455");
                Course before = new Course(course);
                Course after = new Course("DATA", "Capstone", "499");
                after.setId(course.getId());
                when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
                CourseRequest request = new CourseRequest("DATA", "Capstone", "499", null, null, null, null,
                                null,
                                null, null, null);
                CourseDto courseDto = new CourseDto(1L, "DATA", "Capstone", "499");
                when(courseMapper.courseToDto(course)).thenReturn(courseDto);
                CourseDto dto = courseService.updateCourse(request, 1L, userIdFromHeader);

                assertEquals("DATA", dto.deptCode());
                assertEquals("Capstone", dto.name());
                assertEquals("499", dto.courseNum());
                verify(auditService).record(
                                eq(userIdFromHeader),
                                eq(ActionOptions.UPDATE),
                                eq("Course"),
                                eq(before),
                                eq(after),
                                eq(before.getId()));
        }

        @Test
        void testDeleteCourseNotFound() {
                Long userIdFromHeader = 1L;
                // when(courseRepository.existsById(1L)).thenReturn(false);
                when(courseRepository.findById(1L))
                                .thenReturn(Optional.empty());
                NotFoundException ex = assertThrows(NotFoundException.class,
                                () -> courseService.deleteCourse(1L, userIdFromHeader));

                assertEquals("No course with id 1", ex.getMessage());
        }

        @Test
        void testDeleteCourseSuccess() {
                Long userIdFromHeader = 1L;
                Course toDelete = new Course("COSC", "Capstone", "499");

                when(courseRepository.findById(1L)).thenReturn(Optional.of(toDelete));
                String response = courseService.deleteCourse(1L, userIdFromHeader);

                assertEquals("Course deleted", response);
                verify(auditService).record(
                                eq(userIdFromHeader),
                                eq(ActionOptions.DELETE),
                                eq("Course"),
                                eq(toDelete),
                                eq(null),
                                eq(toDelete.getId()));
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
                CourseDto courseDto1 = new CourseDto(1L, "COSC", "Distributed Systems", "455");
                CourseDto courseDto2 = new CourseDto(2L, "COSC", "Operating Systems", "315");
                when(courseMapper.courseToDto(course1)).thenReturn(courseDto1);
                when(courseMapper.courseToDto(course2)).thenReturn(courseDto2);

                List<CourseDto> result = courseService.findCoursesByIds(Arrays.asList(1L, 2L));

                assertEquals(2, result.size());
                assertEquals("Distributed Systems", result.get(0).name());
                assertEquals("Operating Systems", result.get(1).name());
        }

        @Test
        void testFilterCourses() {
                CourseSectionScheduleDto dto1 = new CourseSectionScheduleDto(1L, 3L, "COSC", "Distributed Systems",
                                "455", "001", 2025,
                                "W1",
                                SectionType.LABORATORY, "Wed", LocalTime.of(14, 00), LocalTime.of(15, 30), false);
                CourseSectionScheduleDto dto2 = new CourseSectionScheduleDto(2L, 4L, "COSC", "Operating Systems", "S",
                                "002", 2025,
                                "W2",
                                SectionType.LABORATORY, "Wed", LocalTime.of(14, 00), LocalTime.of(15, 30), false);

                CourseFilterRequest filterRequest = new CourseFilterRequest("COSC", null, null, null, 2025, "W1", null,
                                "Wed",
                                LocalTime.of(14, 00), LocalTime.of(15, 30));
                when(courseRepository.courseFilter("COSC", null, null, null, 2025, "W1", null, "Wed",
                                LocalTime.of(14, 00),
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
                Section section = new Section(2025, "W1", "001", SectionType.LABORATORY, course, null);
                section.setId(1L);

                NeedDto need = new NeedDto(5L, courseId, "Grading", 30, 15, year, semester, null);
                OfferDto offer = new OfferDto(1L, true, "description");
                AllocationHistoryDtoWithCourse dto = new AllocationHistoryDtoWithCourse(
                                42L,
                                new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT), 12345678,
                                                "COSC", 2025, 3, null,
                                                null, null,
                                                true),
                                offer,
                                true,
                                10,
                                new SectionDto(99L, 2024, "W1", "001", SectionType.LECTURE,
                                                new CourseDto(1L, "COSC", "CS", "112")));

                when(sectionRepository.findByCourseIdAndYearAndSemester(courseId, year, semester))
                                .thenReturn(Optional.of(section));
                when(needService.getNeed(courseId, year, semester)).thenReturn(need);
                when(applicationInterface.getAllocationsBySectionId(section.getId()))
                                .thenReturn(ResponseEntity.ok(List.of(dto)));

                CourseNeedAndAllocations result = courseService.getCourseNeedAndAllocations(courseId, year, semester);

                assertEquals("Networks", result.section().course().name());
                assertEquals("Grading", result.need().description());
                assertEquals(1, result.allocations().size());
                assertEquals("Alice", result.allocations().get(0).student().firstName());
        }

        @Test
        void testGetCourseNeedAndAllocations_CourseNotFound() {
                when(sectionRepository.findByCourseIdAndYearAndSemester(404L, 2025, "W1")).thenReturn(Optional.empty());
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
                                11L, 2025, "W1", "002", SectionType.LABORATORY,
                                new CourseDto(1L, "COSC", "Security", "430"));
                OfferDto offer = new OfferDto(1L, true, "description");
                NeedDto need = new NeedDto(10L, 1L, "Labs", 25, 10, 2025, "W1", null);
                AllocationHistoryDtoWithCourse dto = new AllocationHistoryDtoWithCourse(
                                42L,
                                new UserDto(2L, "Alice", "Wang", "awang@test.com", List.of(UserRole.STUDENT),
                                                12345678,
                                                "COSC", 2025, 3, null, null, null, true),
                                offer,
                                true,
                                10,
                                new SectionDto(99L, 2024, "W1", "001", SectionType.LECTURE,
                                                new CourseDto(1L, "COSC", "CS", "112")));

                when(sectionService.getInstructorSections(instructorId)).thenReturn(List.of(section1,
                                section2));
                when(needService.getNeed(1L, 2025, "W1")).thenReturn(need);
                when(applicationInterface.getAllocationsBySectionId(any())).thenReturn(ResponseEntity.ok(List.of(dto)));

                List<CourseNeedAndAllocations> result = courseService
                                .getInstructorCourseNeedsAndAllocations(instructorId);

                assertEquals(2, result.size());
                assertEquals("Security", result.get(0).section().course().name());
                assertEquals("Labs", result.get(0).need().description());
                assertEquals("Alice",
                                result.get(0).allocations().get(0).student().firstName());
        }

        @Test
        void testGetInstructorCourseNeedsAndAllocations_DoesNotIgnorenWhenMissingNeed() {
                Long instructorId = 77L;

                SectionDto section1 = new SectionDto(
                                10L, 2025, "W1", "001", SectionType.LECTURE,
                                new CourseDto(1L, "COSC", "Security", "430"));

                when(sectionService.getInstructorSections(instructorId)).thenReturn(List.of(section1));
                when(needService.getNeed(1L, 2025, "W1")).thenThrow(new NotFoundException("Need not found"));
                when(applicationInterface.getAllocationsBySectionId(10L))
                                .thenReturn(ResponseEntity.ok(Collections.emptyList()));
                List<CourseNeedAndAllocations> result = courseService
                                .getInstructorCourseNeedsAndAllocations(instructorId);

                assertEquals(1, result.size());
        }

        @Test
        void testGetInstructorSpecificCourseNeedsAndAllocations_WithCourseFilter_Success() {
                Long instructorId = 77L;
                Long courseId = 1L;
                Integer year = 2025;
                String semester = "W1";

                // — prepare a fake Section entity & its DTO
                Section sectionEntity = mock(Section.class);
                when(sectionEntity.getId()).thenReturn(10L);

                Course dummyCourse = mock(Course.class);
                when(dummyCourse.getId()).thenReturn(courseId);
                when(sectionEntity.getCourse()).thenReturn(dummyCourse);
                when(sectionEntity.getYear()).thenReturn(year);
                when(sectionEntity.getSemester()).thenReturn(semester);

                SectionDto sectionDto = new SectionDto(
                                10L, year, semester, "001", SectionType.LECTURE,
                                new CourseDto(courseId, "COSC", "Security", "430"));

                // — a NeedDto and one allocation
                NeedDto needDto = new NeedDto(10L, courseId, "Labs", 25, 10, year, semester, null);

                AllocationHistoryDtoWithCourse alloc = new AllocationHistoryDtoWithCourse(
                                42L,
                                new UserDto(2L, "Alice", "Wang", "awang@test.com",
                                                List.of(UserRole.STUDENT), 12345678,
                                                "COSC", 2025, 3, null, null, null, true),
                                new OfferDto(1L, true, "description"),
                                true,
                                10,
                                new SectionDto(99L, 2024, "W1", "001", SectionType.LECTURE,
                                                new CourseDto(1L, "COSC", "CS", "112")));

                // — stubbing repository, mapper, services
                when(sectionRepository.findByInstructorIdAndCourseIdAndYearAndSemester(
                                instructorId, courseId, year, semester))
                                .thenReturn(List.of(sectionEntity));

                when(sectionMapper.sectionToDto(sectionEntity))
                                .thenReturn(sectionDto);

                when(needService.getNeed(1L, 2025, "W1"))
                                .thenReturn(needDto);

                when(applicationInterface.getAllocationsBySectionId(10L))
                                .thenReturn(ResponseEntity.ok(List.of(alloc)));

                // — execute
                List<CourseNeedAndAllocations> result = courseService.getInstructorSpecificCourseNeedsAndAllocations(
                                instructorId, courseId, year, semester);

                // — verify
                assertEquals(1, result.size());
                CourseNeedAndAllocations entry = result.get(0);
                assertEquals(sectionDto, entry.section());
                assertEquals(needDto, entry.need());
                assertEquals(1, entry.allocations().size());
                assertEquals("Alice",
                                entry.allocations().get(0).student().firstName());
        }

        @Test
        void testGetInstructorSpecificCourseNeedsAndAllocations_MissingNeedAndAllocations() {
                Long instructorId = 77L;
                Integer year = 2025;
                String semester = "W1";
                Long courseId = 1L;
                // — one Section, but no course filter (courseId == null)
                Section sectionEntity = mock(Section.class);
                when(sectionEntity.getId()).thenReturn(11L);

                Course dummyCourse = mock(Course.class);
                when(dummyCourse.getId()).thenReturn(courseId);
                when(sectionEntity.getCourse()).thenReturn(dummyCourse);
                when(sectionEntity.getYear()).thenReturn(year);
                when(sectionEntity.getSemester()).thenReturn(semester);

                SectionDto sectionDto = new SectionDto(
                                11L, 2025, "W1", "002", SectionType.LABORATORY,
                                new CourseDto(1L, "COSC", "Security", "430"));

                when(sectionRepository.findByInstructorIdAndYearAndSemester(
                                instructorId, year, semester))
                                .thenReturn(List.of(sectionEntity));

                when(sectionMapper.sectionToDto(sectionEntity))
                                .thenReturn(sectionDto);

                // — simulate “need not found”
                when(needService.getNeed(1L, 2025, "W1"))
                                .thenThrow(new NotFoundException("no need"));

                // — simulate null body → empty allocations list
                when(applicationInterface.getAllocationsBySectionId(11L))
                                .thenReturn(ResponseEntity.ok(null));

                // — execute
                List<CourseNeedAndAllocations> result = courseService.getInstructorSpecificCourseNeedsAndAllocations(
                                instructorId, null, year, semester);

                // — verify we still get one entry, with null need and empty allocations
                assertEquals(1, result.size());
                CourseNeedAndAllocations entry = result.get(0);
                assertEquals(sectionDto, entry.section());
                assertNull(entry.need());
                assertTrue(entry.allocations().isEmpty());
        }

        @Test
        void testGetAllDeptCodes() {
                List<String> mock = List.of("COSC", "MATH");
                when(courseRepository.findAllUniqueDeptCode()).thenReturn(mock);

                List<String> result = courseService.getAllDeptCodes();
                assertEquals(mock, result);
        }

        @Test
        void testGetAllCourseNums() {
                List<String> mock = List.of("121", "310");
                when(courseRepository.findDistinctCourseNumByDeptCode("COSC")).thenReturn(mock);

                List<String> result = courseService.getAllCourseNums("COSC");
                assertEquals(mock, result);
        }

        @Test
        void testGetAllSections() {
                List<String> mock = List.of("001", "002");
                when(courseRepository.findSectionsByDeptCodeAndCourseNum("COSC", "310")).thenReturn(mock);

                List<String> result = courseService.getAllSections("COSC", "310");
                assertEquals(mock, result);
        }

        @Test
        void testGetAllYears() {
                List<String> mock = List.of("2023", "2024");
                when(courseRepository.findAllDistinctYearStrings()).thenReturn(mock);

                List<String> result = courseService.getAllYears();
                assertEquals(mock, result);
        }

        @Test
        void testAddStudentTaughtCourse_Success() {
                Long courseId = 1L;
                Long studentId = 1001L;
                Long userIdFromHeader = 1L;

                Course course = new Course("COSC", "Software Engineering", "310");
                course.setId(courseId);
                when(courseRepository.findById(courseId))
                                .thenReturn(Optional.of(course));

                StudentTaughtCourse savedEntity = StudentTaughtCourse.builder()
                                .course(course)
                                .studentId(studentId)
                                .semester(Semester.W1)
                                .year(2024)
                                .build();
                savedEntity.setId(555L);
                when(studentTaughtCourseRepository.save(any(StudentTaughtCourse.class)))
                                .thenReturn(savedEntity);


                UserDto fakeStudentDto = new UserDto(
                                studentId,
                                "First",
                                "Last",
                                "email@example.com",
                                List.of(),
                                null, null, null, null, null, null,
                                LocalDateTime.now(),
                                true);

                CourseDto fakeCourseDto = new CourseDto(
                                courseId,
                                "COSC",
                                "Software Engineering",
                                "310");

                                
                StudentTaughtCourseDto expectedDto = new StudentTaughtCourseDto(
                                savedEntity.getId(),
                                fakeStudentDto,
                                fakeCourseDto,
                                savedEntity.getSemester(),
                                savedEntity.getYear());

                // stub the mapper to return it
                when(studentTaughtCourseMapper.toDto(savedEntity))
                                .thenReturn(expectedDto);

                StudentTaughtCourseRequest request = new StudentTaughtCourseRequest(
                                studentId,
                                2024,
                                Semester.W1);

                StudentTaughtCourseDto resultDto = courseService.addStudentTaughtCourse(courseId, request,
                                userIdFromHeader);

                verify(studentTaughtCourseRepository)
                                .save(any(StudentTaughtCourse.class));

                verify(auditService).record(
                                eq(userIdFromHeader),
                                eq(ActionOptions.CREATE),
                                eq("StudentTaughtCourse"),
                                isNull(),
                                eq(savedEntity),
                                eq(savedEntity.getId()));

                assertEquals(resultDto.student(), fakeStudentDto);
                assertEquals(resultDto.course(), fakeCourseDto);
        }

        @Test
        void testDeleteStudentTaughtCourse_Success() {
                Long studentId = 1001L;
                Long courseId = 1L;
                Long userIdFromHeader = 1L;
                StudentTaughtCourse stc = new StudentTaughtCourse();

                when(studentTaughtCourseRepository.findByStudentIdAndCourseId(studentId, courseId))
                                .thenReturn(stc);

                courseService.deleteStudentTaughtCourse(studentId, courseId, userIdFromHeader);

                verify(studentTaughtCourseRepository).delete(stc);

                verify(auditService).record(
                                eq(userIdFromHeader),
                                eq(ActionOptions.DELETE),
                                eq("StudentTaughtCourse"),
                                eq(stc),
                                isNull(),
                                eq(stc.getId()));
        }

        @Test
        void testGetCoursesTaughtByStudent_Success() {
                Long studentId = 1001L;

                Course course = new Course("COSC", "Operating Systems", "315");
                course.setId(1L);

                StudentTaughtCourse record = StudentTaughtCourse.builder()
                                .id(10L)
                                .studentId(studentId)
                                .course(course)
                                .semester(Semester.S2)
                                .year(2023)
                                .build();

                when(studentTaughtCourseRepository.findByStudentId(studentId)).thenReturn(List.of(record));
                when(userInterface.getStudentById(studentId))
                                .thenReturn(new UserDto(2L, "Alice", "Wang", "awang@test.com",
                                                List.of(UserRole.STUDENT), 12345678, "COSC", 2025, 3, null,
                                                null, null, true));

                List<StudentTaughtCourseDto> result = courseService.getCoursesTaughtByStudent(studentId);

                assertEquals(1, result.size());
                assertEquals("Alice", result.get(0).student().firstName());
                assertEquals("Operating Systems", result.get(0).course().name());
                assertEquals(Semester.S2, result.get(0).semester());
                assertEquals(2023, result.get(0).year());
        }

        @Test
        void shouldReturnCourseDtoWhenFound() {
                Course course = new Course("COSC", "CAPSTONE", "499");
                course.setId(1L);

                CourseDto dto = new CourseDto(1L, "COSC", "CAPSTONE", "499");

                when(courseRepository.findByDeptCodeAndCourseNum("COSC", "499"))
                                .thenReturn(Optional.of(course));

                when(courseMapper.courseToDto(course)).thenReturn(dto);

                CourseDto result = courseService.getByDeptCodeAndCourseNum("COSC", "499");

                assertEquals("COSC", result.deptCode());
                assertEquals("499", result.courseNum());
        }

        @Test
        void testGetCoursesWithoutNeeds() {
                Course course = new Course("COSC", "CAPSTONE", "499");
                course.setId(1L);
                CourseDto dto = new CourseDto(1L, "COSC", "CAPSTONE", "499");
                when(courseRepository.findCoursesWithoutNeedsByYearAndSemester(any(), any()))
                                .thenReturn(List.of(course));
                when(courseMapper.courseToDto(course)).thenReturn(dto);

                List<CourseDto> result = courseService.getCoursesWithoutNeeds(2025, "W1");
                assertEquals("COSC", result.get(0).deptCode());
                assertEquals("499", result.get(0).courseNum());
        }

        @Test
        void testGetCoursesForInstructor() {
                Long instructorId = 7L;

                // 1. Prepare two Course entities
                Course course1 = new Course();
                course1.setId(11L);
                course1.setDeptCode("COSC");
                course1.setName("Distributed Systems");
                course1.setCourseNum("455");

                Course course2 = new Course();
                course2.setId(22L);
                course2.setDeptCode("MATH");
                course2.setName("Calculus");
                course2.setCourseNum("101");

                List<Course> courses = List.of(course1, course2);

                when(courseRepository.findDistinctCoursesByInstructorId(instructorId))
                                .thenReturn(courses);

                CourseDto dto1 = new CourseDto(11L, "COSC", "Distributed Systems", "455");
                CourseDto dto2 = new CourseDto(22L, "MATH", "Calculus", "101");
                when(courseMapper.courseToDto(course1)).thenReturn(dto1);
                when(courseMapper.courseToDto(course2)).thenReturn(dto2);

                List<CourseDto> result = courseService.getCoursesForInstructor(instructorId);

                assertNotNull(result);
                assertEquals(2, result.size(), "Should return two course dtos");

                assertEquals(11L, result.get(0).id());
                assertEquals("COSC", result.get(0).deptCode());
                assertEquals("Distributed Systems", result.get(0).name());
                assertEquals("455", result.get(0).courseNum());

                assertEquals(22L, result.get(1).id());
                assertEquals("MATH", result.get(1).deptCode());
                assertEquals("Calculus", result.get(1).name());
                assertEquals("101", result.get(1).courseNum());
        }
}