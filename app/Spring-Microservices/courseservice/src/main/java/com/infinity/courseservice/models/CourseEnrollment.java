package com.infinity.courseservice.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class CourseEnrollment {

    @Id
    @GeneratedValue
    private Long id;

    private Long studentId;

    @ManyToOne
    @JoinColumn(name = "course", nullable = false)
    private Course course; 

    private boolean hasCompleted;

    public CourseEnrollment(Long studentId, Course course, boolean hasCompleted) {
        this.studentId = studentId;
        this.course = course;
        this.hasCompleted = hasCompleted;
    }
}
