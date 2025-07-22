package com.infinity.courseservice.models;

import java.time.LocalDate;
import java.time.LocalTime;

import com.infinity.courseservice.enums.ExamTask;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class ExamAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "exam_id")
    private Exam exam;

    private Long studentId;

    @Enumerated(EnumType.STRING)
    private ExamTask task;

    private LocalDate date;

    private LocalTime startTime;

    private LocalTime endTime; 
}
