package com.infinity.applicationservice;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.infinity.applicationservice.dtos.DeadlineDto;
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
    void testGetDeadlineByName_ShouldReturnDeadline() {
        when(configRepository.findByName("student_application_deadline")).thenReturn(entity);

        DeadlineDto result = configService.getDeadlineByName("student_application_deadline");

        assertThat(result.name()).isEqualTo("student_application_deadline");
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
void testDeleteDeadline_ShouldDeleteAndReturnDto() {

    when(configRepository.findByName("student_application_deadline")).thenReturn(entity);

    DeadlineDto result = configService.deleteDeadline("student_application_deadline");

    assertThat(result.name()).isEqualTo("student_application_deadline");
    assertThat(result.startTime()).isEqualTo(entity.getStartTime());
    assertThat(result.endTime()).isEqualTo(entity.getEndTime());

    verify(configRepository).delete(entity);
}
}
