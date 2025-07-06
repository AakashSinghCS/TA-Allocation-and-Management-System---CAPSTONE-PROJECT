package com.infinity.applicationservice;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.anyList;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
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

    @BeforeEach
    void setUp() {
        sampleDeadline = new GlobalDeadline();
        sampleDeadline.setId(1L);
        sampleDeadline.setName("student_application_deadline");
        sampleDeadline.setStartTime(LocalDateTime.parse("2025-08-01T00:00:00"));
        sampleDeadline.setEndTime(LocalDateTime.parse("2025-08-31T23:59:59"));
    }

    @Test
    void testGetDeadlines_ShouldReturnAll() {
        when(configRepository.findAll()).thenReturn(List.of(sampleDeadline));

        List<GlobalDeadline> result = configService.getDeadlines();

        assertThat(result).containsExactly(sampleDeadline);
    }

    @Test
    void testGetDeadlineByName_ShouldReturnDeadline() {
        when(configRepository.findByName("student_application_deadline")).thenReturn(sampleDeadline);

        GlobalDeadline result = configService.getDeadlineByName("student_application_deadline");

        assertThat(result).isEqualTo(sampleDeadline);
    }

    @Test
    void testAddDeadlines_ShouldSaveAll() {
        DeadlineDto dto = new DeadlineDto(
                "student_application_deadline",
                LocalDateTime.parse("2025-08-01T00:00:00"),
                LocalDateTime.parse("2025-08-31T23:59:59")
        );

        when(configRepository.saveAll(anyList())).thenReturn(List.of(sampleDeadline));

        List<GlobalDeadline> result = configService.addDeadlines(List.of(dto));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("student_application_deadline");

        ArgumentCaptor<List<GlobalDeadline>> captor = ArgumentCaptor.forClass(List.class);
        verify(configRepository).saveAll(captor.capture());

        GlobalDeadline captured = captor.getValue().get(0);
        assertThat(captured.getName()).isEqualTo(dto.name());
        assertThat(captured.getStartTime()).isEqualTo(dto.startTime());
        assertThat(captured.getEndTime()).isEqualTo(dto.endTime());
    }

    @Test
    void testUpdateDeadline_ShouldUpdateAndSave() {
        when(configRepository.findByName("student_application_deadline")).thenReturn(sampleDeadline);

        DeadlineDto dto = new DeadlineDto(
                "student_application_deadline",
                LocalDateTime.parse("2025-09-01T00:00:00"),
                LocalDateTime.parse("2025-09-30T23:59:59")
        );

        GlobalDeadline updated = configService.updateDeadline("student_application_deadline", dto);

        assertThat(updated.getStartTime()).isEqualTo(dto.startTime());
        assertThat(updated.getEndTime()).isEqualTo(dto.endTime());

        verify(configRepository).save(sampleDeadline);
    }
}
