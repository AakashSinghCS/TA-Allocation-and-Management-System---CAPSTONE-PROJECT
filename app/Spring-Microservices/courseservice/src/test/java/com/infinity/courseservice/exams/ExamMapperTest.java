package com.infinity.courseservice.exams;

import com.infinity.courseservice.dtos.ExamDtos.ExamAssignmentDto;
import com.infinity.courseservice.dtos.ExamDtos.ExamDto;
import com.infinity.courseservice.enums.ExamTask;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Exam;
import com.infinity.courseservice.models.ExamAssignment;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.repositories.SectionRepository;
import com.infinity.courseservice.utility.ExamMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ExamMapperTest {

    private SectionRepository sectionRepository;
    private ExamMapper examMapper;

    @BeforeEach
    void setUp() {
        sectionRepository = mock(SectionRepository.class);
        examMapper = new ExamMapper(sectionRepository);
    }

    @Test
    void mapExam_returnsMappedDto() {
        Course course = new Course();
        course.setId(1L);

        Semester semester = new Semester(2025, "W1", null, null, true);

        Section section = new Section();
        section.setId(2L);
        section.setCourse(course);
        section.setSemester(semester);

        Exam exam = new Exam();
        exam.setId(3L);
        exam.setSectionId(2L);
        exam.setDate(LocalDate.of(2025, 4, 20));
        exam.setStartTime(LocalTime.of(9, 0));
        exam.setEndTime(LocalTime.of(12, 0));

        when(sectionRepository.findById(2L)).thenReturn(Optional.of(section));

        ExamDto dto = examMapper.mapExam(exam);

        assertEquals(3L, dto.id());
        assertEquals(1L, dto.courseId());
        assertEquals(2L, dto.sectionId());
        assertEquals("W1 W1", dto.term());
        assertEquals(LocalDate.of(2025, 4, 20), dto.date());
        assertEquals(LocalTime.of(9, 0), dto.startTime());
        assertEquals(LocalTime.of(12, 0), dto.endTime());
    }

    @Test
    void mapExam_throwsNotFound_whenSectionMissing() {
        Exam exam = new Exam();
        exam.setSectionId(99L);

        when(sectionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> examMapper.mapExam(exam));
    }

    @Test
    void mapAssignment_returnsMappedDto() {
        Exam exam = new Exam();
        exam.setId(5L);

        ExamAssignment assignment = new ExamAssignment();
        assignment.setId(6L);
        assignment.setExam(exam);
        assignment.setStudentId(7L);
        assignment.setTask(ExamTask.MARKING);
        assignment.setDate(LocalDate.of(2025, 4, 21));
        assignment.setStartTime(LocalTime.of(10, 0));
        assignment.setEndTime(LocalTime.of(13, 0));

        ExamAssignmentDto dto = examMapper.mapAssignment(assignment);

        assertEquals(6L, dto.id());
        assertEquals(5L, dto.examId());
        assertEquals(7L, dto.studentId());
        assertEquals(ExamTask.MARKING, dto.task());
        assertEquals(LocalDate.of(2025, 4, 21), dto.date());
        assertEquals(LocalTime.of(10, 0), dto.startTime());
        assertEquals(LocalTime.of(13, 0), dto.endTime());
    }
}
