package com.infinity.courseservice.models;

import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

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
public class SectionSchedule {

    @Id
    @GeneratedValue
    private Long id;

    private String day;

    private LocalTime startTime;

    private LocalTime endTime;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    public SectionSchedule(String day, LocalTime startTime, LocalTime endTime, Section section) {
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.section = section;
    }
}
