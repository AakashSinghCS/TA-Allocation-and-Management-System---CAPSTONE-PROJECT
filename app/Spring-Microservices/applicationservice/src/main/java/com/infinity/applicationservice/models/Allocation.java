package com.infinity.applicationservice.models;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonBackReference;
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
        this.allocatedSections = other.allocatedSections;
        this.studentId=other.studentId;
        this.application = other.application;
        this.studentId = other.studentId;
    }
}

