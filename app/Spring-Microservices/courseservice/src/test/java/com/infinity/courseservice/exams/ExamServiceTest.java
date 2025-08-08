package com.infinity.courseservice.exams;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cglib.core.Local;

import com.infinity.courseservice.dtos.ExamDtos.ExamAssignmentDto;
import com.infinity.courseservice.dtos.ExamDtos.ExamAvailabilityDto;
import com.infinity.courseservice.dtos.ExamDtos.ExamDto;
import com.infinity.courseservice.enums.ActionOptions;
import com.infinity.courseservice.enums.ExamTask;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Exam;
import com.infinity.courseservice.models.ExamAssignment;
import com.infinity.courseservice.models.ExamAvailability;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.ExamAssignmentRepository;
import com.infinity.courseservice.repositories.ExamAvailabilityRepository;
import com.infinity.courseservice.repositories.ExamRepository;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.services.AuditService;
import com.infinity.courseservice.services.ExamService;
import com.infinity.courseservice.utility.ExamMapper;

@ExtendWith(MockitoExtension.class)
public class ExamServiceTest {

    @Mock
    private ExamRepository examRepository;

    @Mock
    private ExamAvailabilityRepository availabilityRepository;

    @Mock
    private ExamAssignmentRepository assignmentRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private ExamMapper examMapper;

    @Mock
    private SectionRepository sectionRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private ExamService examService;

    // --- Exam CRUD ---

    @Test
    void testCreateExam_Success() {
        Long userIdFromHeader = 1L;
        ExamDto dto = new ExamDto(null, 1L, 1L,"W1 2025", LocalDate.now(), LocalTime.of(9,0), LocalTime.of(12,0));

        Course course = new Course();
        Section section = new Section();
        section.setId(1L);
        course.setSections(List.of(section));

        when(examRepository.findAll()).thenReturn(List.of());

        Exam saved = new Exam();
        saved.setId(10L);
        saved.setSectionId(1L);
        saved.setDate(dto.date());
        saved.setStartTime(dto.startTime());
        saved.setEndTime(dto.endTime());

        when(examRepository.save(any(Exam.class)))
            .thenAnswer(invocation -> {
                Exam toSave = invocation.getArgument(0);
                toSave.setId(saved.getId());
                return toSave;
            });
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));

        ExamDto mapped = new ExamDto(10L, 1L, 1L, "W1 2025", dto.date(), dto.startTime(), dto.endTime());
        when(examMapper.mapExam(saved)).thenReturn(mapped);

        ExamDto result = examService.createExam(dto,userIdFromHeader);

        assertEquals(10L, result.id());
        verify(examRepository).save(any(Exam.class));
        verify(auditService).record(
            eq(userIdFromHeader),
            eq(ActionOptions.CREATE),
            eq("Exam"),
            eq(null),
            eq(saved),
            eq(saved.getId()));
    }

    @Test
    void testCreateExam_DuplicateThrows() {
        Long userIdFromHeader = 1L;
        ExamDto dto = new ExamDto(null, 1L, 1L, "W1 2025", LocalDate.now(), LocalTime.of(9,0), LocalTime.of(12,0));

        Course course = new Course();
        Section section = new Section();
        section.setId(100L);
        course.setSections(List.of(section));


        Exam existing = new Exam();
        existing.setSectionId(100L);
        existing.setDate(dto.date());
        existing.setStartTime(dto.startTime());
        existing.setEndTime(dto.endTime());

        when(examRepository.findAll()).thenReturn(List.of(existing));
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));


        assertThrows(BadRequestException.class, () -> examService.createExam(dto, userIdFromHeader));
    }

    @Test
    void testCreateExam_CourseNotFound() {
        Long userIdFromHeader = 1L;
        ExamDto dto = new ExamDto(null, 1L, 1L, "W1 2025", LocalDate.now(), LocalTime.of(9,0), LocalTime.of(12,0));

        assertThrows(NotFoundException.class, () -> examService.createExam(dto,userIdFromHeader));
    }

    @Test
    void testUpdateExam_NotFound() {
        Long userIdFromHeader = 1L;
        when(examRepository.findById(10L)).thenReturn(Optional.empty());
        ExamDto dto = new ExamDto(null, 1L, 1L, "W1 2025", LocalDate.now(), LocalTime.NOON, LocalTime.MIDNIGHT);

        assertThrows(NotFoundException.class, () -> examService.updateExam(10L, dto, userIdFromHeader));
    }

    @Test
    void testUpdateExam_Success() {
        Long userIdFromHeader = 1L;
        Exam existing = new Exam();
        existing.setId(10L);
        Exam before = new Exam(existing);
        when(examRepository.findById(10L)).thenReturn(Optional.of(existing));
        // when(examRepository.save(any(Exam.class))).thenReturn(existing);
        when(examRepository.save(any(Exam.class)))
            .thenAnswer(invocation ->  invocation.getArgument(0));

        ExamDto mapped = new ExamDto(10L, 1L, 1L, "W1 2025", LocalDate.now(), LocalTime.NOON, LocalTime.MIDNIGHT);
        when(examMapper.mapExam(existing)).thenReturn(mapped);

        ExamDto result = examService.updateExam(10L, mapped, userIdFromHeader);

        assertEquals(10L, result.id());
        verify(auditService).record(
            eq(userIdFromHeader),
            eq(ActionOptions.UPDATE),
            eq("Exam"),
            eq(before),
            eq(existing),
            eq(existing.getId()));
    }

    @Test
    void deleteExam_existingExam_deletesAndAudits() {
        Long examId = 42L;
        Long userIdFromHeader = 1L;

        Exam toDelete = new Exam();
        toDelete.setId(examId);

        when(examRepository.findById(examId))
            .thenReturn(Optional.of(toDelete));

        examService.deleteExam(examId, userIdFromHeader);
        verify(examRepository).delete(toDelete);

        verify(auditService).record(
            eq(userIdFromHeader),
            eq(ActionOptions.DELETE),
            eq("Exam"),
            eq(toDelete),   
            isNull(),        
            eq(examId)        
        );
    }

    @Test
    void deleteExam_nonexistentExam_throwsNotFound() {
        Long examId = 99L;
        Long userIdFromHeader = 1L;
        when(examRepository.findById(examId))
            .thenReturn(Optional.empty());

        NotFoundException ex = assertThrows(
            NotFoundException.class,
            () -> examService.deleteExam(examId, userIdFromHeader)
        );
        assertTrue(ex.getMessage().contains("No exam with id " + examId));
        
        verify(examRepository, never()).delete(any());
        verify(auditService, never()).record(any(), any(), any(), any(), any(), anyLong());
    }


    @Test
    void testGetExamById_NotFound() {
        when(examRepository.findById(10L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> examService.getExamById(10L));
    }

    @Test
    void testGetExamById_Success() {
        Exam exam = new Exam();
        exam.setId(10L);
        when(examRepository.findById(10L)).thenReturn(Optional.of(exam));

        ExamDto mapped = new ExamDto(10L, 1L, 1L, "W1 2025", LocalDate.now(), LocalTime.NOON, LocalTime.MIDNIGHT);
        when(examMapper.mapExam(exam)).thenReturn(mapped);

        ExamDto result = examService.getExamById(10L);
        assertEquals(10L, result.id());
    }

    @Test
    void testGetAllExams() {
        Exam exam = new Exam();
        exam.setId(10L);
        when(examRepository.findAll()).thenReturn(List.of(exam));
        ExamDto mapped = new ExamDto(10L, 1L, 1L, "W1 2025", LocalDate.now(), LocalTime.NOON, LocalTime.MIDNIGHT);
        when(examMapper.mapExam(exam)).thenReturn(mapped);

        List<ExamDto> result = examService.getAllExams();
        assertEquals(1, result.size());
    }

    // --- Availability ---

    @Test
    void testUpdateStudentAvailability() {
        Long userIdFromHeader = 1L;
        Long studentId = 1L;

        ExamAvailability old1 = new ExamAvailability();
        old1.setId(10L);
        old1.setStudentId(studentId);
        old1.setStartTime(LocalTime.MIDNIGHT);

        when(availabilityRepository.findByStudentId(studentId))
             .thenReturn(List.of(old1));

        ExamAvailabilityDto dto1 = new ExamAvailabilityDto(10L, studentId, null, LocalTime.NOON, LocalTime.MIDNIGHT);
        
        List<ExamAvailabilityDto> input = List.of(dto1);

        ExamAvailability new1 = new ExamAvailability();
        new1.setId(10L); 
        new1.setStudentId(studentId);
        new1.setStartTime(LocalTime.NOON);
        new1.setEndTime(LocalTime.MIDNIGHT);
        when(availabilityRepository.saveAll(anyList()))
        .thenAnswer(invocation -> {
            List<ExamAvailability> toSave = invocation.getArgument(0);
            toSave.get(0).setId(10L);
            return toSave;
        });

        List<ExamAvailabilityDto> result = examService.updateStudentAvailability(1L, input, userIdFromHeader);
        assertEquals(1, result.size());
        assertEquals(10L, result.get(0).id());
        assertEquals(LocalTime.NOON,result.get(0).startTime());
        verify(availabilityRepository).deleteByStudentId(studentId);
        verify(auditService).record(
            eq(userIdFromHeader),
            eq(ActionOptions.DELETE),
            eq("ExamAvailability"),
            eq(old1),
            isNull(),
            eq(10L)
        );
        verify(availabilityRepository).saveAll(anyList());
        verify(auditService).record(
            eq(userIdFromHeader),
            eq(ActionOptions.CREATE),
            eq("ExamAvailability"),
            isNull(),
            eq(new1),
            eq(10L)
        );
    }

    @Test
    void testGetAvailabilityByStudentId() {
        ExamAvailability entity = new ExamAvailability();
        entity.setId(1L);
        entity.setStudentId(1L);
        entity.setDate(LocalDate.now());
        entity.setStartTime(LocalTime.NOON);
        entity.setEndTime(LocalTime.MIDNIGHT);

        when(availabilityRepository.findByStudentId(1L)).thenReturn(List.of(entity));

        List<ExamAvailabilityDto> result = examService.getAvailabilityByStudentId(1L);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).studentId());
    }

    @Test
    void deleteAvailabilityByStudentId_shouldCallRepositoryOnce() {
        Long studentId = 1L;
        Long userIdFromHeader    = 1L;

        ExamAvailability old1 = new ExamAvailability();
        old1.setId(10L);
        old1.setStudentId(studentId);

        ExamAvailability old2 = new ExamAvailability();
        old2.setId(20L);
        old2.setStudentId(studentId);

        when(availabilityRepository.findByStudentId(studentId))
            .thenReturn(List.of(old1, old2));

        examService.deleteAvailabilityByStudentId(studentId, userIdFromHeader);

        verify(availabilityRepository).deleteByStudentId(studentId);

        verify(auditService).record(
            eq(userIdFromHeader),
            eq(ActionOptions.DELETE),
            eq("ExamAvailability"),
            eq(old1),
            isNull(),
            eq(10L)
        );
        verify(auditService).record(
            eq(userIdFromHeader),
            eq(ActionOptions.DELETE),
            eq("ExamAvailability"),
            eq(old2),
            isNull(),
            eq(20L)
        );

    }

    // --- Assignments ---

    @Test
    void testAssignStudentToExam_NotFound() {
        Long userIdFromHeader = 1L;
        LocalDate date = LocalDate.of(2025, 12, 15);
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(12, 0);

        ExamAssignmentDto dto = new ExamAssignmentDto(
            null,
            10L,
            1L,
            ExamTask.MARKING,
            date,
            startTime,
            endTime
        );

        when(examRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () ->
            examService.assignStudentToExam(10L, dto, userIdFromHeader)
        );
    }


    @Test
    void testAssignStudentToExam_Success() {
        Long userIdFromHeader = 1L;
        LocalDate date = LocalDate.of(2025, 12, 15);
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(12, 0);

        Exam exam = new Exam();
        exam.setId(10L);

        ExamAssignment saved = new ExamAssignment();
        saved.setId(20L);
        saved.setExam(exam);
        saved.setStudentId(1L);
        saved.setTask(ExamTask.MARKING);
        saved.setDate(date);
        saved.setStartTime(startTime);
        saved.setEndTime(endTime);

        ExamAssignmentDto inputDto = new ExamAssignmentDto(
            null,
            10L,
            1L,
            ExamTask.MARKING,
            date,
            startTime,
            endTime
        );

        ExamAssignmentDto mapped = new ExamAssignmentDto(
            20L,
            10L,
            1L,
            ExamTask.MARKING,
            date,
            startTime,
            endTime
        );

        when(examRepository.findById(10L)).thenReturn(Optional.of(exam));
        // when(assignmentRepository.save(any(ExamAssignment.class))).thenReturn(saved);
        when(assignmentRepository.save(any(ExamAssignment.class)))
        .thenAnswer(invocation -> {
            ExamAssignment toSave = invocation.getArgument(0);
            toSave.setId(saved.getId());
            return toSave;
        });

        when(examMapper.mapAssignment(saved)).thenReturn(mapped);

        ExamAssignmentDto result = examService.assignStudentToExam(10L, inputDto, userIdFromHeader);

        assertEquals(20L, result.id());
        assertEquals(10L, result.examId());
        assertEquals(1L, result.studentId());
        assertEquals(ExamTask.MARKING, result.task());
        assertEquals(date, result.date());
        assertEquals(startTime, result.startTime());
        assertEquals(endTime, result.endTime());
        verify(auditService).record(
            eq(userIdFromHeader),
            eq(ActionOptions.CREATE),
            eq("ExamAssignment"),
            isNull(),
            eq(saved),
            eq(saved.getId())
        );
    }


    @Test
    void testGetAssignmentsByStudentId() {
        LocalDate date = LocalDate.of(2025, 12, 15);
        LocalTime startTime = LocalTime.of(9, 0);
        LocalTime endTime = LocalTime.of(12, 0);
        ExamAssignment entity = new ExamAssignment();
        entity.setId(1L);

        ExamAssignmentDto mapped = new ExamAssignmentDto(1L, 10L, 1L, ExamTask.MARKING, date, startTime, endTime);

        when(assignmentRepository.findByStudentId(1L)).thenReturn(List.of(entity));
        when(examMapper.mapAssignment(entity)).thenReturn(mapped);

        List<ExamAssignmentDto> result = examService.getAssignmentsByStudentId(1L);
        assertEquals(1, result.size());
    }

    @Test
    void testGetAssignmentsForExam() {
        Long examId = 1L;
        Exam exam = new Exam(); exam.setId(examId);
        ExamAssignment assignment = new ExamAssignment();
        assignment.setId(10L);
        assignment.setExam(exam);
        assignment.setStudentId(42L);
        assignment.setTask(ExamTask.MARKING);
        assignment.setDate(LocalDate.of(2025, 5, 1));
        assignment.setStartTime(LocalTime.of(10, 0));
        assignment.setEndTime(LocalTime.of(12, 0));

        when(assignmentRepository.findByExamId(examId)).thenReturn(List.of(assignment));
        when(examMapper.mapAssignment(any())).thenReturn(new ExamAssignmentDto(
            10L, examId, 42L, ExamTask.MARKING, 
            LocalDate.of(2025, 5, 1), 
            LocalTime.of(10, 0), 
            LocalTime.of(12, 0)
        ));

        List<ExamAssignmentDto> result = examService.getAssignmentsForExam(examId);

        assertEquals(1, result.size());
        assertEquals(42L, result.get(0).studentId());
    }

    @Test
    void testUnassignStudentFromExam_Success() {
        Long userIdFromHeader = 1L;
        Long assignmentId = 5L;
        ExamAssignment toDelete = new ExamAssignment();
        toDelete.setId(assignmentId);

        when(assignmentRepository.findById(assignmentId))
         .thenReturn(Optional.of(toDelete));

        examService.unassignStudentFromExam(assignmentId, userIdFromHeader);

        verify(assignmentRepository).delete(toDelete);

        verify(auditService).record(
            eq(userIdFromHeader),
            eq(ActionOptions.DELETE),
            eq("ExamAssignment"),
            eq(toDelete), 
            isNull(),     
            eq(assignmentId)
        );
    }

    @Test
    void testUnassignStudentFromExam_NotFound() {
        Long userIdFromHeader = 1L;
        Long assignmentId = 99L;
        when(assignmentRepository.findById(assignmentId))
         .thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> examService.unassignStudentFromExam(assignmentId, userIdFromHeader));
    }

    @Test
    void testUpdateAssignmentByStudentId() {
        Long userIdFromHeader = 1L;
        Exam exam = new Exam();
        exam.setId(1L);
        
        Long studentId = 2L;

        ExamAssignment existing = new ExamAssignment();
        existing.setId(5L);
        existing.setExam(exam);
        existing.setStudentId(studentId);
        existing.setTask(ExamTask.PREPARATION);
        existing.setStartTime(LocalTime.of(12, 0));
        existing.setEndTime(LocalTime.of(14, 0));
        existing.setDate(LocalDate.parse("2025-08-10"));
        ExamAssignment before = new ExamAssignment(existing);

        ExamAssignmentDto updatedDto = new ExamAssignmentDto(
            5L, exam.getId(), studentId, ExamTask.MARKING, LocalDate.parse("2025-08-10"), LocalTime.of(13, 0), LocalTime.of(15, 0)
        );

        when(assignmentRepository.findByExamIdAndStudentId(exam.getId(), studentId))
            .thenReturn(Optional.of(existing));

        when(assignmentRepository.save(any(ExamAssignment.class)))
            .thenReturn(existing);

        when(examMapper.mapAssignment(existing))
            .thenReturn(updatedDto);

        ExamAssignmentDto result = examService.updateAssignmentByStudentId(exam.getId(), studentId, updatedDto, userIdFromHeader);

        assertEquals(ExamTask.MARKING, result.task());
        assertEquals(LocalTime.of(13, 0), result.startTime());
        assertEquals(LocalTime.of(15, 0), result.endTime());
        verify(auditService).record(
            eq(userIdFromHeader),
            eq(ActionOptions.UPDATE),
            eq("ExamAssignment"),
            eq(before), 
            eq(existing),     
            eq(before.getId())
        );
    }   

}
