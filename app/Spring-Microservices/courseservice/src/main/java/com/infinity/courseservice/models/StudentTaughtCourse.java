package com.infinity.courseservice.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) //Audting recording might not work without this.
public class StudentTaughtCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "semester_id")
    private Semester semester;

    public StudentTaughtCourse(Long studentId, Course course, Semester semester){
        this.studentId = studentId;
        this.course = course;
        this.semester = semester;
    }

    public StudentTaughtCourse(StudentTaughtCourse other){
        this.id= other.id;
        this.course=other.course;
        this.semester=other.semester;
        this.studentId = other.studentId;
    }
}