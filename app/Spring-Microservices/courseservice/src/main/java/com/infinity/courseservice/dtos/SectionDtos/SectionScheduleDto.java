package com.infinity.courseservice.dtos.SectionDtos;

import java.time.LocalTime;

public record SectionScheduleDto(String day, LocalTime startTime, LocalTime endTime, Long sectionId, Long id) {
}
