package com.infinity.applicationservice;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.anyList;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infinity.applicationservice.dtos.DeadlineDto;
import com.infinity.applicationservice.exceptions.BadRequestException;
import com.infinity.applicationservice.exceptions.NotFoundException;
import com.infinity.applicationservice.models.GlobalDeadline;
import com.infinity.applicationservice.repositories.ConfigRepository;
import com.infinity.applicationservice.services.ConfigService;

@ExtendWith(MockitoExtension.class)
public class ConfigServiceTest {

    @Mock
    ConfigRepository configRepository;

    @InjectMocks
    ConfigService configService;

    private GlobalDeadline sampleDeadline;

    private GlobalDeadline entity;
    private DeadlineDto dto;

    @BeforeEach
    void setUp() {
        entity = new GlobalDeadline();
        entity.setId(1L);
        entity.setName("student_application_deadline");
        entity.setStartTime(LocalDateTime.parse("2025-08-01T00:00:00"));
        entity.setEndTime(LocalDateTime.parse("2025-08-31T23:59:59"));

        dto = new DeadlineDto(
                "student_application_deadline",
                LocalDateTime.parse("2025-08-01T00:00:00"),
                LocalDateTime.parse("2025-08-31T23:59:59")
        );
    }

    @Test
    void testGetDeadlines_ShouldReturnAll() {
        when(configRepository.findAll()).thenReturn(List.of(entity));

        List<DeadlineDto> result = configService.getDeadlines();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("student_application_deadline");
    }

    @Test
    void testGetDeadlines_ShouldThrowNotFoundException() {
        when(configRepository.findAll()).thenThrow(new NotFoundException("DB error"));
        NotFoundException ex = assertThrows(NotFoundException.class, () -> configService.getDeadlines());
        assertThat(ex.getMessage()).contains("Failed to fetch deadlines");
    }

    @Test
    void testGetDeadlineByName_ShouldReturnDeadline() {
        when(configRepository.findByName("student_application_deadline")).thenReturn(entity);

        DeadlineDto result = configService.getDeadlineByName("student_application_deadline");

        assertThat(result.name()).isEqualTo("student_application_deadline");
    }

    @Test
    void testGetDeadlineByName_ShouldThrowNotFoundException() {
        when(configRepository.findByName("not_exist")).thenReturn(null);

        NotFoundException ex = assertThrows(NotFoundException.class, () -> configService.getDeadlineByName("not_exist"));
        assertThat(ex.getMessage()).contains("not found");
    }

    @Test
    void testGetDeadlineByName_ShouldThrowNotFoundExceptionOnRepo() {
        when(configRepository.findByName("student_application_deadline")).thenThrow(new NotFoundException("DB error"));
        NotFoundException ex = assertThrows(NotFoundException.class, () -> configService.getDeadlineByName("student_application_deadline"));
        assertThat(ex.getMessage()).contains("Failed to fetch deadline by name");
    }

    @Test
    void testAddDeadlines_ShouldSaveAll() {
        DeadlineDto requestDto = new DeadlineDto(
                "student_application_deadline",
                LocalDateTime.parse("2025-08-01T00:00:00"),
                LocalDateTime.parse("2025-08-31T23:59:59")
        );

        when(configRepository.saveAll(anyList())).thenReturn(List.of(entity));

        List<DeadlineDto> result = configService.addDeadlines(List.of(requestDto));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("student_application_deadline");
    }

    @Test
    void testAddDeadlines_ShouldThrowBadRequestException() {
        when(configRepository.saveAll(anyList())).thenThrow(new BadRequestException("DB error"));
        BadRequestException ex = assertThrows(BadRequestException.class, () -> configService.addDeadlines(List.of(dto)));
        assertThat(ex.getMessage()).contains("Failed to add deadlines");
    }

    @Test
    void testUpdateDeadline_ShouldUpdateAndSave() {
        when(configRepository.findByName("student_application_deadline")).thenReturn(entity);

        DeadlineDto updateDto = new DeadlineDto(
                "student_application_deadline",
                LocalDateTime.parse("2025-09-01T00:00:00"),
                LocalDateTime.parse("2025-09-30T23:59:59")
        );

        DeadlineDto result = configService.updateDeadline("student_application_deadline", updateDto);

        assertThat(result.startTime()).isEqualTo(updateDto.startTime());
        assertThat(result.endTime()).isEqualTo(updateDto.endTime());

        verify(configRepository).save(entity);
    }

    @Test
    void testUpdateDeadline_ShouldThrowNotFoundException() {
        when(configRepository.findByName("not_exist")).thenReturn(null);
        DeadlineDto updateDto = new DeadlineDto(
                "not_exist",
                LocalDateTime.now(),
                LocalDateTime.now()
        );
        NotFoundException ex = assertThrows(NotFoundException.class, () -> configService.updateDeadline("not_exist", updateDto));
        assertThat(ex.getMessage()).contains("not found");
    }

    @Test
    void testUpdateDeadline_ShouldThrowNotFoundExceptionOnRepo() {
        when(configRepository.findByName("student_application_deadline")).thenThrow(new NotFoundException("DB error"));
        DeadlineDto updateDto = new DeadlineDto(
                "student_application_deadline",
                LocalDateTime.now(),
                LocalDateTime.now()
        );
        NotFoundException ex = assertThrows(NotFoundException.class, () -> configService.updateDeadline("student_application_deadline", updateDto));
        assertThat(ex.getMessage()).contains("Failed to update deadline");
    }

    @Test
    void testDeleteDeadline_ShouldDeleteAndReturnDto() {
        when(configRepository.findByName("student_application_deadline")).thenReturn(entity);

        DeadlineDto result = configService.deleteDeadline("student_application_deadline");

        assertThat(result.name()).isEqualTo("student_application_deadline");
        assertThat(result.startTime()).isEqualTo(entity.getStartTime());
        assertThat(result.endTime()).isEqualTo(entity.getEndTime());

        verify(configRepository).delete(entity);
    }

    @Test
    void testDeleteDeadline_ShouldThrowNotFoundException() {
        when(configRepository.findByName("not_exist")).thenReturn(null);
        NotFoundException ex = assertThrows(NotFoundException.class, () -> configService.deleteDeadline("not_exist"));
        assertThat(ex.getMessage()).contains("not found");
    }

    @Test
    void testDeleteDeadline_ShouldThrowNotFoundExceptionOnRepo() {
        when(configRepository.findByName("student_application_deadline")).thenThrow(new NotFoundException("DB error"));
        NotFoundException ex = assertThrows(NotFoundException.class, () -> configService.deleteDeadline("student_application_deadline"));
        assertThat(ex.getMessage()).contains("Failed to delete deadline");
    }
}
