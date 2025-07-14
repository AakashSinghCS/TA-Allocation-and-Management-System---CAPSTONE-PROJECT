package com.infinity.courseservice.dtos.ExamDtos;
import com.infinity.courseservice.enums.ExamTask;

public record ExamAssignmentDto(
    Long id,
    Long examId,
    Long studentId,
    ExamTask task
) {}
