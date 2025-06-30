package com.infinity.courseservice.dtos;

public record QualificationDto(
    CourseDto course,
    String description,
    StudentDto student
) {
    // public QualificationDto(Qualification q, StudentDto s) {
    //     CourseDto course = new CourseDto(q.getCourse().getDeptCode(), q.getCourse().getName(), q.getCourse().getCourseNum());
    //     this(course, q.getQualification(), s);
    // }
}