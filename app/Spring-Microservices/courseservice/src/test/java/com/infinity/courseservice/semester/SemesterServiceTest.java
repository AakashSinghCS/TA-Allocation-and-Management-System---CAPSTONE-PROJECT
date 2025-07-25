package com.infinity.courseservice.semester;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import com.infinity.courseservice.dtos.Semesters.SemesterDto;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.DuplicateEntryException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.repositories.SemesterRepository;
import com.infinity.courseservice.services.SemesterService;
import com.infinity.courseservice.utility.SemesterMapper;

@ExtendWith(MockitoExtension.class)
class SemesterServiceTest {

    @Mock
    private SemesterRepository semesterRepository;

    @Mock
    private SemesterMapper semesterMapper;

    @InjectMocks
    private SemesterService semesterService;

    private SemesterDto validDto;
    private Semester validEntity;

    @BeforeEach
    void setUp() {
        validDto = new SemesterDto(1L, 2025, "W1",
                LocalDate.of(2025, 9, 1), LocalDate.of(2025, 12, 1));
        validEntity = new Semester(2025, "W1",
                LocalDate.of(2025, 9, 1), LocalDate.of(2025, 12, 1));
        validEntity.setId(1L);
    }

    @Test
    void addSemester_validInput_savesAndReturnsDto() {
        when(semesterMapper.toSemester(validDto)).thenReturn(validEntity);
        when(semesterRepository.save(validEntity)).thenReturn(validEntity);
        when(semesterMapper.toDto(validEntity)).thenReturn(validDto);

        SemesterDto result = semesterService.addSemester(validDto);

        assertEquals(validDto, result);
        verify(semesterRepository).save(validEntity);
    }

    @Test
    void addSemester_startDateAfterEndDate_throwsBadRequest() {
        SemesterDto badDto = new SemesterDto(1L, 2025, "W1",
                LocalDate.of(2025, 12, 1), LocalDate.of(2025, 9, 1));

        assertThrows(BadRequestException.class, () -> semesterService.addSemester(badDto));
    }

    @Test
    void addSemester_yearMismatch_throwsBadRequest() {
        SemesterDto badDto = new SemesterDto(1L, 2024, "W1",
                LocalDate.of(2025, 9, 1), LocalDate.of(2025, 12, 1));

        assertThrows(BadRequestException.class, () -> semesterService.addSemester(badDto));
    }

    @Test
    void addSemester_duplicateEntry_throwsDuplicateEntryException() {
        when(semesterMapper.toSemester(validDto)).thenReturn(validEntity);
        when(semesterRepository.save(validEntity))
                .thenThrow(new DataIntegrityViolationException("constraint violation"));

        assertThrows(DuplicateEntryException.class, () -> semesterService.addSemester(validDto));
    }

    @Test
    void getSemesterById_existingId_returnsDto() {
        when(semesterRepository.findById(1L)).thenReturn(Optional.of(validEntity));
        when(semesterMapper.toDto(validEntity)).thenReturn(validDto);

        SemesterDto result = semesterService.getSemesterById(1L);

        assertEquals(validDto, result);
    }

    @Test
    void getSemesterById_missingId_throwsNotFound() {
        when(semesterRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> semesterService.getSemesterById(1L));
    }

    @Test
    void getAllSemesters_returnsListOfDtos() {
        when(semesterRepository.findAll()).thenReturn(List.of(validEntity));
        when(semesterMapper.toDto(validEntity)).thenReturn(validDto);

        List<SemesterDto> result = semesterService.getAllSemesters();

        assertEquals(1, result.size());
        assertEquals(validDto, result.get(0));
    }

    @Test
    void updateSemester_validInput_returnsUpdatedDto() {
        SemesterDto updateDto = new SemesterDto(1L, 2025, "W2",
                LocalDate.of(2025, 9, 5), LocalDate.of(2025, 12, 5));

        when(semesterRepository.findById(1L)).thenReturn(Optional.of(validEntity));
        when(semesterRepository.save(validEntity)).thenReturn(validEntity);
        when(semesterMapper.toDto(validEntity)).thenReturn(updateDto);

        SemesterDto result = semesterService.updateSemester(1L, updateDto);

        assertEquals(updateDto, result);
    }

    @Test
    void updateSemester_duplicateEntry_throwsDuplicateEntryException() {
        SemesterDto updateDto = new SemesterDto(1L, 2025, "W2",
                LocalDate.of(2025, 9, 1), LocalDate.of(2025, 12, 1));

        when(semesterRepository.findById(1L)).thenReturn(Optional.of(validEntity));
        when(semesterRepository.save(validEntity))
                .thenThrow(new DataIntegrityViolationException("constraint violation"));

        assertThrows(DuplicateEntryException.class, () -> semesterService.updateSemester(1L, updateDto));
    }

    @Test
    void deleteSemester_existingId_deletesSuccessfully() {
        when(semesterRepository.existsById(1L)).thenReturn(true);

        String result = semesterService.deleteSemester(1L);

        assertEquals("Semester deleted", result);
        verify(semesterRepository).deleteById(1L);
    }

    @Test
    void deleteSemester_missingId_throwsNotFound() {
        when(semesterRepository.existsById(1L)).thenReturn(false);

        assertThrows(NotFoundException.class, () -> semesterService.deleteSemester(1L));
    }
}
