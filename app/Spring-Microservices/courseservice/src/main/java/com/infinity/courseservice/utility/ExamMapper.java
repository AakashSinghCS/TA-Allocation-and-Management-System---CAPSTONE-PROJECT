package com.infinity.courseservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.courseservice.dtos.ExamDtos.ExamAssignmentDto;
import com.infinity.courseservice.dtos.ExamDtos.ExamDto;
import com.infinity.courseservice.models.Exam;
import com.infinity.courseservice.models.ExamAssignment;

@Component
public class ExamMapper {
    public ExamDto mapExam(Exam exam) {
        return new ExamDto(
            exam.getId(),
            exam.getSectionId(),
            exam.getDate(),
            exam.getStartTime(),
            exam.getEndTime()
        );
    }

    public ExamAssignmentDto mapAssignment(ExamAssignment a) {
        return new ExamAssignmentDto(
            a.getId(),
            a.getExam().getId(),
            a.getStudentId(),
            a.getTask(),
            a.getDate(),
            a.getStartTime(),
            a.getEndTime()
        );
    }
}
