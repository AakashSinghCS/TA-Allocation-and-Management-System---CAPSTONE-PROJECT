package com.infinity.courseservice.models;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Semester {
    
    @Id
    @GeneratedValue
    private Long id;

    private Integer year;

    private String semester;

    private LocalDate startDate;

    private LocalDate endDate;

    public Semester(Integer year, String semester, LocalDate startDate, LocalDate endDate) {
        this.year = year;
        this.semester = semester;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}
