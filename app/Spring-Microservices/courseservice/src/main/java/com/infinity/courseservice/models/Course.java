package com.infinity.courseservice.models;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Course {
    
    @Id
    @GeneratedValue
    private Long id;

    private String subject;
    private Integer courseNum;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseEnrollment> enrollments;

    public Course(String subject, Integer courseNum) {
        this.subject = subject;
        this.courseNum = courseNum;
    }
}
