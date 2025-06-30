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
public class Qualification {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    private Long studentId;
    private String description;
    private String deptCode;

    public Qualification(Course course, Long studentId, String description, String deptCode){
        this.course = course;
        this.studentId = studentId;
        this.description = description;
        this.deptCode = deptCode;
    }
}
