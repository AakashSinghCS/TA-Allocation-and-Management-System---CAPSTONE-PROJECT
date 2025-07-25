package com.infinity.courseservice.utility;

import org.springframework.stereotype.Component;

import com.infinity.courseservice.dtos.Semesters.SemesterDto;
import com.infinity.courseservice.models.Semester;

@Component
public class SemesterMapper {
    public SemesterDto toDto(Semester semester) {
        return new SemesterDto(semester.getId(),
                semester.getYear(),
                semester.getSemester(),
                semester.getStartDate(),
                semester.getEndDate());
    }
    
    public Semester toSemester(SemesterDto semester) {
        return new Semester(
                semester.year(),
                semester.semester(),
                semester.startDate(),
                semester.endDate());
    }
}
