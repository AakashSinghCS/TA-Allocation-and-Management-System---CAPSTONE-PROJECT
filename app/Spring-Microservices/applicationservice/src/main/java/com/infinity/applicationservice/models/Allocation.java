package com.infinity.applicationservice.models;

import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.infinity.applicationservice.enums.ApplicationStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) //Audting recording might not work without this.
public class Allocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    private double labPrepHours;
    private int gradingHours;
    private double sectionHours;

    @Column(name = "student_id")
    private Long studentId;
    
    @OneToOne
    @JoinColumn(name = "application_id")
    @JsonBackReference("app-alloc")
    private Application application;

    @JsonManagedReference
    @OneToMany(mappedBy = "allocation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AllocatedSection> allocatedSections;
    
    //TODO: prevent orphaned keys when deleting sections! make it be null.
    // @Column(name = "section_id", nullable = true)
    // private Long sectionId;

    public Allocation(Allocation other) {
        this.id = other.id;
        this.status= other.status;
        this.labPrepHours = other.labPrepHours;
        this.gradingHours = other.gradingHours;
        this.sectionHours = other.sectionHours;
        this.allocatedSections = (other.allocatedSections == null ? List.<AllocatedSection>of() : other.allocatedSections)
            .stream()
            .map(AllocatedSection::new)   
            .collect(Collectors.toList());
        this.studentId=other.studentId;
        this.application = other.application;
        this.studentId = other.studentId;
    }
}

