package com.infinity.courseservice.dtos.ExamDtos;
import java.time.LocalDate;
import java.time.LocalTime;

public record ExamDto(
    Long id,
    Long courseId,
    LocalDate date,
    LocalTime startTime,
    LocalTime endTime
) {}

