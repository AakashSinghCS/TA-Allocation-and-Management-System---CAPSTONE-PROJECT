package com.infinity.applicationservice.models;

import com.infinity.applicationservice.enums.ApplicationStatus;

import jakarta.persistence.*;
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

    private int numberOfHours;

    @Column(name = "student_id")
    private Long studentId;
    
    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;

    //TODO: prevent orphaned keys when deleting sections! make it be null.
    @Column(name = "section_id", nullable = true)
    private Long sectionId;

    public Allocation(Allocation other) {
        this.id = other.id;
        this.status= other.status;
        this.numberOfHours = other.numberOfHours;
        this.studentId=other.studentId;
        this.application = other.application;
        this.studentId = other.studentId;
    }
}

