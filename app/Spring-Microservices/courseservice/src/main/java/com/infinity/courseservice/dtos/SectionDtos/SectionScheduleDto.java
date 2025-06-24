package com.infinity.courseservice.dtos.SectionDtos;

import java.time.LocalTime;

import com.infinity.courseservice.models.Section;

public record SectionScheduleDto(String day, LocalTime startTime, LocalTime endTime, Long sectionId) {
}
