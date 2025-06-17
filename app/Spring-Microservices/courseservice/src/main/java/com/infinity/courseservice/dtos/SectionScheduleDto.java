package com.infinity.courseservice.dtos;

import java.time.LocalTime;

import com.infinity.courseservice.models.Section;

public record SectionScheduleDto(String day, LocalTime startTime, LocalTime endTime, Long sectionId) {
}
