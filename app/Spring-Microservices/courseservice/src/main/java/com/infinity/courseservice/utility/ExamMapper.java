package com.infinity.courseservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.courseservice.dtos.ExamDtos.ExamAssignmentDto;
import com.infinity.courseservice.dtos.ExamDtos.ExamDto;
import com.infinity.courseservice.exceptions.NotFoundException;
import com.infinity.courseservice.models.Exam;
import com.infinity.courseservice.models.ExamAssignment;
import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.repositories.SectionRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ExamMapper {

    private final SectionRepository sectionRepository;

    public ExamDto mapExam(Exam exam) {
        Section section = sectionRepository.findById(exam.getSectionId())
                .orElseThrow(() -> new NotFoundException("Section not found"));

        String term = section.getSemester() + " " + section.getYear();

        return new ExamDto(
            exam.getId(),
            exam.getSectionId(),
            term,
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
