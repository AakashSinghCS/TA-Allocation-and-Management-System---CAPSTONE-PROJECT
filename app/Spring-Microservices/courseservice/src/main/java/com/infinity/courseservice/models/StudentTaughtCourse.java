package com.infinity.courseservice.models;

import java.io.Serializable;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "studentTaughtcourse", uniqueConstraints = {
        @UniqueConstraint(name = "uk_stc_unique_row", 
                columnNames = { "student_id","course_id", "semester_id"})
})
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) //Audting recording might not work without this.
public class StudentTaughtCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
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

