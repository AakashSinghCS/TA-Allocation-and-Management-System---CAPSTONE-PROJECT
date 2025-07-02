package com.infinity.courseservice.dtos.CourseDtos;

import com.infinity.courseservice.enums.Semester;

public record StudentTaughtCourseRequest(Long studentId, int year, Semester semester) {
    
}
