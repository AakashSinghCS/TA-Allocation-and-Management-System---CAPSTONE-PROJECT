package com.infinity.courseservice.models;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sectionId;

    private LocalDate date;

    private LocalTime startTime;

    private LocalTime endTime;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL)
    private List<ExamAssignment> assignments;
}

