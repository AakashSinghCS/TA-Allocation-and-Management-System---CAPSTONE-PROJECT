package com.infinity.courseservice.models;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

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
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) //Audting recording might not work without this.
public class Exam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sectionId;

    private LocalDate date;

    private LocalTime startTime;

    private LocalTime endTime;

    @OneToMany(mappedBy = "exam", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<ExamAssignment> assignments;

    public Exam(Exam other){
        this.id= other.id;
        this.sectionId= other.sectionId;
        this.date= other.date;
        this.startTime=other.startTime;
        this.endTime=other.endTime;
        this.assignments = (other.assignments == null ? List.<ExamAssignment>of() : other.assignments)
            .stream()
            .map(ExamAssignment::new)   
            .collect(Collectors.toList());
    }
}

