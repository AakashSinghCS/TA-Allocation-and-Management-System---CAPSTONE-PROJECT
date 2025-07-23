package com.infinity.courseservice;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infinity.courseservice.dtos.ExamDtos.ExamAssignmentDto;
import com.infinity.courseservice.dtos.ExamDtos.ExamAvailabilityDto;
import com.infinity.courseservice.dtos.ExamDtos.ExamDto;
import com.infinity.courseservice.enums.ExamTask;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Exam;
import com.infinity.courseservice.models.ExamAssignment;
import com.infinity.courseservice.models.ExamAvailability;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.repositories.CourseRepository;
import com.infinity.courseservice.repositories.ExamAssignmentRepository;
import com.infinity.courseservice.repositories.ExamAvailabilityRepository;
import com.infinity.courseservice.repositories.ExamRepository;
import com.infinity.courseservice.repositories.SectionRepository;
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

    @InjectMocks
    private ExamService examService;

    // --- Exam CRUD ---

    @Test
    void testCreateExam_Success() {
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

        when(examRepository.save(any(Exam.class))).thenReturn(saved);
        when(sectionRepository.findById(1L)).thenReturn(Optional.of(section));

        ExamDto mapped = new ExamDto(10L, 1L, 1L, "W1 2025", dto.date(), dto.startTime(), dto.endTime());
        when(examMapper.mapExam(saved)).thenReturn(mapped);

        ExamDto result = examService.createExam(dto);

        assertEquals(10L, result.id());
        verify(examRepository).save(any(Exam.class));
    }

    @Test
    void testCreateExam_DuplicateThrows() {
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


        assertThrows(BadRequestException.class, () -> examService.createExam(dto));
    }

    @Test
    void testCreateExam_CourseBadRequest() {
        ExamDto dto = new ExamDto(null, 1L, 1L, "W1 2025", LocalDate.now(), LocalTime.of(9,0), LocalTime.of(12,0));

        assertThrows(BadRequestException.class, () -> examService.createExam(dto));
    }

    @Test
    void testUpdateExam_BadRequest() {
        when(examRepository.findById(10L)).thenReturn(Optional.empty());
        ExamDto dto = new ExamDto(null, 1L, 1L, "W1 2025", LocalDate.now(), LocalTime.NOON, LocalTime.MIDNIGHT);

        assertThrows(BadRequestException.class, () -> examService.updateExam(10L, dto));
    }

    @Test
    void testUpdateExam_Success() {
        Exam existing = new Exam();
        existing.setId(10L);

        when(examRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(examRepository.save(any(Exam.class))).thenReturn(existing);

        ExamDto mapped = new ExamDto(10L, 1L, 1L, "W1 2025", LocalDate.now(), LocalTime.NOON, LocalTime.MIDNIGHT);
        when(examMapper.mapExam(existing)).thenReturn(mapped);

        ExamDto result = examService.updateExam(10L, mapped);

        assertEquals(10L, result.id());
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

    // --- Exception handling for CRUD ---

    @Test
    void testCreateExam_shouldThrowBadRequest_onGenericException() {
        ExamDto dto = new ExamDto(null, 1L, 1L, "W1 2025", LocalDate.now(), LocalTime.NOON, LocalTime.MIDNIGHT);
        when(sectionRepository.findById(anyLong())).thenThrow(new RuntimeException("DB error"));
        BadRequestException ex = assertThrows(BadRequestException.class, () -> examService.createExam(dto));
        assertTrue(ex.getMessage().contains("Failed to create exam"));
    }

    @Test
    void testUpdateExam_shouldThrowBadRequest_onGenericException() {
        ExamDto dto = new ExamDto(null, 1L, 1L, "W1 2025", LocalDate.now(), LocalTime.NOON, LocalTime.MIDNIGHT);
        when(examRepository.findById(anyLong())).thenThrow(new RuntimeException("DB error"));
        BadRequestException ex = assertThrows(BadRequestException.class, () -> examService.updateExam(1L, dto));
        assertTrue(ex.getMessage().contains("Failed to update exam"));
    }

    @Test
    void testDeleteExam_shouldThrowNotFound_whenNotExists() {
        when(examRepository.existsById(1L)).thenReturn(false);
        NotFoundException ex = assertThrows(NotFoundException.class, () -> examService.deleteExam(1L));
        assertTrue(ex.getMessage().toLowerCase().contains("exam not found"));
    }

    @Test
    void testDeleteExam_shouldThrowBadRequest_onGenericException() {
        when(examRepository.existsById(1L)).thenReturn(true);
        doThrow(new RuntimeException("DB error")).when(examRepository).deleteById(1L);
        BadRequestException ex = assertThrows(BadRequestException.class, () -> examService.deleteExam(1L));
        assertTrue(ex.getMessage().contains("Failed to delete exam"));
    }

    @Test
    void testGetAllExams_shouldThrowNotFound_onGenericException() {
        when(examRepository.findAll()).thenThrow(new RuntimeException("DB error"));
        NotFoundException ex = assertThrows(NotFoundException.class, () -> examService.getAllExams());
        assertTrue(ex.getMessage().contains("Failed to fetch exams"));
    }

    @Test
    void testGetExamById_shouldThrowNotFound_onGenericException() {
        when(examRepository.findById(anyLong())).thenThrow(new RuntimeException("DB error"));
        NotFoundException ex = assertThrows(NotFoundException.class, () -> examService.getExamById(1L));
        assertTrue(ex.getMessage().contains("Failed to fetch exam"));
    }

    // --- Availability ---

    @Test
    void testUpdateStudentAvailability() {
        ExamAvailabilityDto dto1 = new ExamAvailabilityDto(null, null, LocalDate.now(), LocalTime.NOON, LocalTime.MIDNIGHT);
        List<ExamAvailabilityDto> input = List.of(dto1);

        List<ExamAvailability> savedEntities = List.of(new ExamAvailability());
        when(availabilityRepository.saveAll(any())).thenReturn(savedEntities);

        List<ExamAvailabilityDto> result = examService.updateStudentAvailability(1L, input);
        verify(availabilityRepository).deleteByStudentId(1L);
        verify(availabilityRepository).saveAll(any());
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

        examService.deleteAvailabilityByStudentId(studentId);

        verify(availabilityRepository, times(1)).deleteByStudentId(studentId);
    }

    // --- Exception handling for Availability ---

    @Test
    void testUpdateStudentAvailability_shouldThrowBadRequest_onGenericException() {
        doThrow(new RuntimeException("DB error")).when(availabilityRepository).deleteByStudentId(anyLong());
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                examService.updateStudentAvailability(1L, List.of(new ExamAvailabilityDto(null, null, LocalDate.now(), LocalTime.NOON, LocalTime.MIDNIGHT))));
        assertTrue(ex.getMessage().contains("Failed to update student availability"));
    }

    @Test
    void testGetAvailabilityByStudentId_shouldThrowNotFound_onGenericException() {
        when(availabilityRepository.findByStudentId(anyLong())).thenThrow(new RuntimeException("DB error"));
        NotFoundException ex = assertThrows(NotFoundException.class, () -> examService.getAvailabilityByStudentId(1L));
        assertTrue(ex.getMessage().contains("Failed to fetch availability for student"));
    }

    @Test
    void testDeleteAvailabilityByStudentId_shouldThrowBadRequest_onGenericException() {
        doThrow(new RuntimeException("DB error")).when(availabilityRepository).deleteByStudentId(anyLong());
        BadRequestException ex = assertThrows(BadRequestException.class, () -> examService.deleteAvailabilityByStudentId(1L));
        assertTrue(ex.getMessage().contains("Failed to delete availability for student"));
    }

    // --- Assignments ---

    @Test
    void testAssignStudentToExam_NotFound() {
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
            examService.assignStudentToExam(10L, dto)
        );
    }


    @Test
    void testAssignStudentToExam_Success() {
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
        when(assignmentRepository.save(any(ExamAssignment.class))).thenReturn(saved);
        when(examMapper.mapAssignment(saved)).thenReturn(mapped);

        ExamAssignmentDto result = examService.assignStudentToExam(10L, inputDto);

        assertEquals(20L, result.id());
        assertEquals(10L, result.examId());
        assertEquals(1L, result.studentId());
        assertEquals(ExamTask.MARKING, result.task());
        assertEquals(date, result.date());
        assertEquals(startTime, result.startTime());
        assertEquals(endTime, result.endTime());
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
    void testAssignStudentToExam_shouldThrowNotFound_onNotFoundException() {
        when(examRepository.findById(anyLong())).thenThrow(new NotFoundException("Exam not found"));
        ExamAssignmentDto dto = new ExamAssignmentDto(null, 1L, 1L, ExamTask.MARKING, LocalDate.now(), LocalTime.NOON, LocalTime.MIDNIGHT);
        NotFoundException ex = assertThrows(NotFoundException.class, () -> examService.assignStudentToExam(1L, dto));
        assertTrue(ex.getMessage().contains("Failed to find exam"));
    }

    @Test
    void testAssignStudentToExam_shouldThrowBadRequest_onGenericException() {
        when(examRepository.findById(anyLong())).thenThrow(new RuntimeException("DB error"));
        ExamAssignmentDto dto = new ExamAssignmentDto(null, 1L, 1L, ExamTask.MARKING, LocalDate.now(), LocalTime.NOON, LocalTime.MIDNIGHT);
        BadRequestException ex = assertThrows(BadRequestException.class, () -> examService.assignStudentToExam(1L, dto));
        assertTrue(ex.getMessage().contains("Failed to assign student to exam"));
    }

    @Test
    void testGetAssignmentsByStudentId_shouldThrowNotFound_onGenericException() {
        when(assignmentRepository.findByStudentId(anyLong())).thenThrow(new RuntimeException("DB error"));
        NotFoundException ex = assertThrows(NotFoundException.class, () -> examService.getAssignmentsByStudentId(1L));
        assertTrue(ex.getMessage().contains("Failed to fetch assignments for student"));
    }

    @Test
    void testGetAssignmentsByExamId_shouldThrowNotFound_onGenericException() {
        when(assignmentRepository.findById(anyLong())).thenThrow(new RuntimeException("DB error"));
        NotFoundException ex = assertThrows(NotFoundException.class, () -> examService.getAssignmentsByExamId(1L));
        assertTrue(ex.getMessage().contains("Failed to fetch assignments for exam"));
    }

    @Test
    void testDeleteAssignment_shouldThrowNotFound_whenNotExists() {
        when(assignmentRepository.existsById(1L)).thenReturn(false);
        NotFoundException ex = assertThrows(NotFoundException.class, () -> examService.deleteAssignment(1L));
        assertTrue(ex.getMessage().toLowerCase().contains("assignment not found"));
    }

    @Test
    void testDeleteAssignment_shouldThrowBadRequest_onGenericException() {
        when(assignmentRepository.existsById(1L)).thenReturn(true);
        doThrow(new RuntimeException("DB error")).when(assignmentRepository).deleteById(1L);
        BadRequestException ex = assertThrows(BadRequestException.class, () -> examService.deleteAssignment(1L));
        assertTrue(ex.getMessage().contains("Failed to delete assignment"));
    }
}
