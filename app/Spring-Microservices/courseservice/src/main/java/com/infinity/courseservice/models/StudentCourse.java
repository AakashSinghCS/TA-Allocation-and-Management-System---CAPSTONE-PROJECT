package com.infinity.courseservice.models;

import com.infinity.courseservice.enums.EnrollmentStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "student_course",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"studentId", "course_id"})
       })
public class StudentCourse {

    @Id
    @GeneratedValue
    private Long id;

    private Long studentId;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @ManyToOne
    @JoinColumn(name = "section_id")
    private Section section;

    @Enumerated(EnumType.STRING)
    private EnrollmentStatus status;

    private Integer grade;

    private Integer classAvg;

    public StudentCourse(Long studentId, Course course, EnrollmentStatus status, Section section,
            Integer grade, Integer classAvg) {
        this.studentId = studentId;
        this.course = course;
        this.status = status;
        this.section = section;
        this.grade = grade;
        this.classAvg = classAvg;
    }
}
