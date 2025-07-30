package com.infinity.courseservice.semester;

import com.infinity.courseservice.dtos.Semesters.SemesterDto;
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.utility.SemesterMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class SemesterMapperTest {

    private SemesterMapper semesterMapper;

    @BeforeEach
    void setUp() {
        semesterMapper = new SemesterMapper();
    }

    @Test
    void toDto_mapsSemesterToDtoCorrectly() {
        Semester semester = new Semester();
        semester.setId(1L);
        semester.setYear(2025);
        semester.setSemester("W2");
        semester.setStartDate(LocalDate.of(2025, 1, 8));
        semester.setEndDate(LocalDate.of(2025, 4, 15));

        SemesterDto dto = semesterMapper.toDto(semester);

        assertEquals(1L, dto.id());
        assertEquals(2025, dto.year());
        assertEquals("W2", dto.semester());
        assertEquals(LocalDate.of(2025, 1, 8), dto.startDate());
        assertEquals(LocalDate.of(2025, 4, 15), dto.endDate());
    }

    @Test
    void toSemester_mapsDtoToSemesterCorrectly() {
        SemesterDto dto = new SemesterDto(
                null,
                2024,
                "S1",
                LocalDate.of(2024, 5, 1),
                LocalDate.of(2024, 8, 1), true);

        Semester semester = semesterMapper.toSemester(dto);

        assertNull(semester.getId());
        assertEquals(2024, semester.getYear());
        assertEquals("S1", semester.getSemester());
        assertEquals(LocalDate.of(2024, 5, 1), semester.getStartDate());
        assertEquals(LocalDate.of(2024, 8, 1), semester.getEndDate());
    }
}
