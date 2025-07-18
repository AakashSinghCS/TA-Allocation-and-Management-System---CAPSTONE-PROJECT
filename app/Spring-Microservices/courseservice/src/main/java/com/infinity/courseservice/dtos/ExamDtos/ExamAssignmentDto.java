package com.infinity.courseservice.dtos.ExamDtos;
import java.time.LocalDate;
import java.time.LocalTime;

import com.infinity.courseservice.enums.ExamTask;

public record ExamAssignmentDto(
    Long id,
    Long examId,
    Long studentId,
    ExamTask task,
    LocalDate date,
    LocalTime startTime,
    LocalTime endTime
) {}
