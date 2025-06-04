package com.infinity.courseservice.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
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
    private Long courseId;  

    private boolean hasCompleted;
}
