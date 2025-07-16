package com.infinity.courseservice.dtos.ExamDtos;
import java.time.LocalDate;
import java.time.LocalTime;

public record ExamAvailabilityDto(
    Long id,
    Long studentId,
    LocalDate date,
    LocalTime startTime,
    LocalTime endTime
) {}
