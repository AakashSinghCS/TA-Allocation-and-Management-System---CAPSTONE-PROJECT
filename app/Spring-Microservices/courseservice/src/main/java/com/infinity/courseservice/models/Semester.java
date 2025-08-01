package com.infinity.courseservice.models;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "semester", uniqueConstraints = @UniqueConstraint(columnNames = {"year", "semester"}))
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) //Audting recording might not work without this.
public class Semester {
    
    @Id
    @GeneratedValue
    private Long id;

    private Integer year;

    private String semester;

    private LocalDate startDate;

    private LocalDate endDate;

    private boolean isActive;

    public Semester(Integer year, String semester, LocalDate startDate, LocalDate endDate, boolean isActive) {
        this.year = year;
        this.semester = semester;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isActive = isActive;
    }

    public Semester(Semester other){
        this.id = other.id;
        this.year = other.year;
        this.semester = other.semester;
        this.startDate= other.startDate;
        this.endDate= other.endDate;
    }
}
