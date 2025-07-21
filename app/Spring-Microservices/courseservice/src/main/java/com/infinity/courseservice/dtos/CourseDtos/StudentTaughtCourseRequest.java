package com.infinity.courseservice.dtos.CourseDtos;

import com.infinity.courseservice.dtos.SemesterDto;

public record StudentTaughtCourseRequest(Long studentId, SemesterDto semester) {
    
}
