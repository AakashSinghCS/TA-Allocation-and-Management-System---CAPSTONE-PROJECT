package com.infinity.applicationservice;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;

import com.infinity.applicationservice.dtos.DeadlineDto;
import com.infinity.applicationservice.models.GlobalDeadline;
import com.infinity.applicationservice.utility.ConfigMapper;

public class ConfigMapperTest {

    @Test
    void testToDto_ShouldMapFieldsCorrectly() {
        // Arrange
        GlobalDeadline entity = new GlobalDeadline();
        entity.setName("student_application_deadline");
        entity.setStartTime(LocalDateTime.of(2025, 8, 1, 0, 0));
        entity.setEndTime(LocalDateTime.of(2025, 8, 31, 23, 59));

        // Act
        DeadlineDto dto = ConfigMapper.toDto(entity);

        // Assert
        assertThat(dto).isNotNull();
        assertThat(dto.name()).isEqualTo("student_application_deadline");
        assertThat(dto.startTime()).isEqualTo(LocalDateTime.of(2025, 8, 1, 0, 0));
        assertThat(dto.endTime()).isEqualTo(LocalDateTime.of(2025, 8, 31, 23, 59));
    }
}
