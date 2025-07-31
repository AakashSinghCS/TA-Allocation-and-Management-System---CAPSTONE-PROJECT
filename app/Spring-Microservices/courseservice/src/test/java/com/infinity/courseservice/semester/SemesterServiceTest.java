package com.infinity.courseservice.semester;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
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
import com.infinity.courseservice.enums.ActionOptions;
import com.infinity.courseservice.exceptions.BadRequestException;
import com.infinity.courseservice.exceptions.DuplicateEntryException;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.Semester;
import com.infinity.courseservice.repositories.SemesterRepository;
import com.infinity.courseservice.services.AuditService;
import com.infinity.courseservice.services.SemesterService;
import com.infinity.courseservice.utility.SemesterMapper;

@ExtendWith(MockitoExtension.class)
class SemesterServiceTest {

    @Mock
    private SemesterRepository semesterRepository;

    @Mock
    private SemesterMapper semesterMapper;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private SemesterService semesterService;

    private SemesterDto activeDto;
    private Semester activeEntity;
    private SemesterDto inactiveDto;
    private Semester inactiveEntity;

    @BeforeEach
    void setUp() {
        activeDto = new SemesterDto(1L, 2025, "W1",
                LocalDate.of(2025, 9, 1), LocalDate.of(2025, 12, 1), true);
        activeEntity = new Semester(2025, "W1",
                LocalDate.of(2025, 9, 1), LocalDate.of(2025, 12, 1), true);
        activeEntity.setId(1L);
        inactiveDto = new SemesterDto(1L, 2026, "S1",
                LocalDate.of(2026, 6, 13), LocalDate.of(2026, 7, 17), false);
        inactiveEntity = new Semester(2026, "S1",
                LocalDate.of(2026, 6, 13), LocalDate.of(2026, 7, 17), false);
        inactiveEntity.setId(2L);
    }

    @Test
    void addSemester_validInput_savesAndReturnsDto() {
        Long userIdFromHeader = 1L;
         when(semesterMapper.toSemester(activeDto)).thenReturn(activeEntity);
        // when(semesterRepository.save(validEntity)).thenReturn(validEntity);
        when(semesterRepository.save(any(Semester.class)))
            .thenAnswer(invocation -> {
                Semester toSave = invocation.getArgument(0);
                toSave.setId(activeEntity.getId());
                return toSave;
            });
        when(semesterMapper.toDto(activeEntity)).thenReturn(activeDto);

        SemesterDto result = semesterService.addSemester(activeDto, userIdFromHeader);

        assertEquals(activeDto, result);
        verify(semesterRepository).save(activeEntity);
        verify(auditService).record(
            eq(userIdFromHeader),
            eq(ActionOptions.CREATE),
            eq("Semester"),
            eq(null),
            eq(activeEntity),
            eq(activeEntity.getId()));
    }

    @Test
    void addSemester_startDateAfterEndDate_throwsBadRequest() {
        Long userIdFromHeader = 1L;
        SemesterDto badDto = new SemesterDto(1L, 2025, "W1",
                LocalDate.of(2025, 12, 1), LocalDate.of(2025, 9, 1), true);

        assertThrows(BadRequestException.class, () -> semesterService.addSemester(badDto,userIdFromHeader));
    }

    @Test
    void addSemester_yearMismatch_throwsBadRequest() {
        Long userIdFromHeader = 1L;
        SemesterDto badDto = new SemesterDto(1L, 2024, "W1",
                LocalDate.of(2025, 9, 1), LocalDate.of(2025, 12, 1), true);

        assertThrows(BadRequestException.class, () -> semesterService.addSemester(badDto,userIdFromHeader));
    }

    @Test
    void addSemester_duplicateEntry_throwsDuplicateEntryException() {
        Long userIdFromHeader = 1L;
        when(semesterMapper.toSemester(activeDto)).thenReturn(activeEntity);
         when(semesterRepository.save(
                activeEntity))
                .thenThrow(new DataIntegrityViolationException("constraint violation"));

        assertThrows(DuplicateEntryException.class, () -> semesterService.addSemester(activeDto, userIdFromHeader));
    }

    @Test
    void getSemesterById_existingId_returnsDto() {
        when(semesterRepository.findById(1L)).thenReturn(Optional.of(activeEntity));
        when(semesterMapper.toDto(activeEntity)).thenReturn(activeDto);

        SemesterDto result = semesterService.getSemesterById(1L);

        assertEquals(activeDto, result);
    }

    @Test
    void getSemesterById_missingId_throwsNotFound() {
        when(semesterRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> semesterService.getSemesterById(1L));
    }

    @Test
    void getAllSemesters_returnsListOfDtos() {
        when(semesterRepository.findAllByOrderByStartDateAsc()).thenReturn(List.of(activeEntity, inactiveEntity));
        when(semesterMapper.toDto(activeEntity)).thenReturn(activeDto);
        when(semesterMapper.toDto(inactiveEntity)).thenReturn(inactiveDto);

        List<SemesterDto> result = semesterService.getAllSemesters();

        assertEquals(2, result.size());
        assertEquals(activeDto, result.get(0));
    }

    @Test
    void updateSemester_validInput_returnsUpdatedDto() {
        Long userIdFromHeader = 1L;
         Semester before = new Semester(activeEntity);
        SemesterDto updateDto = new SemesterDto(1L, 2025, "W2",
                LocalDate.of(2025, 9, 5), LocalDate.of(2025, 12, 5), true);

        when(semesterRepository.findById(1L)).thenReturn(Optional.of(activeEntity));
        when(semesterRepository.save(any(Semester.class)))
            .thenAnswer(invocation -> {
                Semester toSave = invocation.getArgument(0);
                toSave.setId(before.getId());
                return toSave;
            });
        when(semesterMapper.toDto(activeEntity)).thenReturn(updateDto);

        SemesterDto result = semesterService.updateSemester(1L, updateDto,userIdFromHeader);
        assertEquals(updateDto, result);
        verify(auditService).record(
            eq(userIdFromHeader),
            eq(ActionOptions.UPDATE),
            eq("Semester"),
            eq(before),
            eq(activeEntity),
            eq(before.getId()));
    }

    @Test
    void updateSemester_duplicateEntry_throwsDuplicateEntryException() {
        Long userIdFromHeader = 1L;
        SemesterDto updateDto = new SemesterDto(1L, 2025, "W2",
                LocalDate.of(2025, 9, 1), LocalDate.of(2025, 12, 1), true);

        when(semesterRepository.findById(1L)).thenReturn(Optional.of(activeEntity));
        when(semesterRepository.save(
                activeEntity))
                .thenThrow(new DataIntegrityViolationException("constraint violation"));

        assertThrows(DuplicateEntryException.class, () -> semesterService.updateSemester(1L, updateDto,userIdFromHeader));
    }

    @Test
    void deleteSemester_existingId_deletesSuccessfully() {
        Long userIdFromHeader = 1L;
        when(semesterRepository.findById(1L)).thenReturn(Optional.of(activeEntity));

        String result = semesterService.deleteSemester(1L,userIdFromHeader);

        assertEquals("Semester deleted", result);
        verify(semesterRepository).delete(activeEntity);
        verify(auditService).record(
            eq(userIdFromHeader),
            eq(ActionOptions.DELETE),
            eq("Semester"),
            eq(activeEntity),
            eq(null),
            eq(activeEntity.getId()));
    }

    @Test
    void deleteSemester_missingId_throwsNotFound() {
        Long userIdFromHeader = 1L;
        when(semesterRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> semesterService.deleteSemester(1L,userIdFromHeader));
    }

    @Test
    void getSemesterByYearAndSemester_returnsDto_whenFound() {
        Semester semester = new Semester(2025, "W1", LocalDate.of(2025, 9, 1), LocalDate.of(2025, 12, 1), true);
        SemesterDto dto = new SemesterDto(1L, 2025, "W1", LocalDate.of(2025, 9, 1), LocalDate.of(2025, 12, 1), true);

        when(semesterRepository.findByYearAndSemester(2025, "W1")).thenReturn(Optional.of(semester));
        when(semesterMapper.toDto(semester)).thenReturn(dto);

        SemesterDto result = semesterService.getSemesterByYearAndSemester(2025, "W1");

        assertEquals(dto, result);
    }

    @Test
    void getSemesterByYearAndSemester_throwsException_whenNotFound() {
        when(semesterRepository.findByYearAndSemester(2026, "W2")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> semesterService.getSemesterByYearAndSemester(2026, "W2"));
    }

    @Test
    void getAllFutureSemesters_returnsMappedList() {
        LocalDate today = LocalDate.now();
        Semester futureSemester = new Semester(2026, "W1", today.plusMonths(3), today.plusMonths(6), true);
        SemesterDto dto = new SemesterDto(1L, 2026, "W1", futureSemester.getStartDate(), futureSemester.getEndDate(),
                true);

        when(semesterRepository.findByStartDateAfterOrderByStartDateAsc(today)).thenReturn(List.of(futureSemester));
        when(semesterMapper.toDto(futureSemester)).thenReturn(dto);

        List<SemesterDto> result = semesterService.getAllFutureSemesters();

        assertEquals(1, result.size());
        assertEquals(dto, result.get(0));
    }

    @Test
    void getSemestersByState_returnsMappedSemesters_whenActiveTrue() {
        when(semesterRepository.findByIsActiveOrderByStartDateAsc(true)).thenReturn(List.of(activeEntity));
        when(semesterMapper.toDto(activeEntity)).thenReturn(activeDto);

        List<SemesterDto> result = semesterService.getSemestersByState(true);

        assertEquals(1, result.size());
        assertEquals("W1", result.get(0).semester());
    }

    @Test
    void getSemestersByState_returnsMappedSemesters_whenActiveFalse() {
        when(semesterRepository.findByIsActiveOrderByStartDateAsc(false)).thenReturn(List.of(inactiveEntity));
        when(semesterMapper.toDto(inactiveEntity)).thenReturn(inactiveDto);

        List<SemesterDto> result = semesterService.getSemestersByState(false);

        assertEquals(1, result.size());
        assertEquals("S1", result.get(0).semester());
    }
}
