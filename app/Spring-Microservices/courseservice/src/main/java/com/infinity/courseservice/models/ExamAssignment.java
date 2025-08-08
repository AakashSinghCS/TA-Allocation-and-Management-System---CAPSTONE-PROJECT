package com.infinity.courseservice.models;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) //Audting recording might not work without this.
public class ExamAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "exam_id")
    @JsonBackReference
    private Exam exam;

    private Long studentId;

    @Enumerated(EnumType.STRING)
    private ExamTask task;

    private LocalDate date;

    private LocalTime startTime;

    private LocalTime endTime; 

    public ExamAssignment(ExamAssignment other){
        this.id = other.id;
        this.exam = other.exam;
        this.studentId=other.studentId;
        this.task = other.task;
        this.date = other.date;
        this.startTime = other.startTime;
        this.endTime= other.endTime;
    }
}
