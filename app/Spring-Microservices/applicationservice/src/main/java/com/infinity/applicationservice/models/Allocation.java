package com.infinity.applicationservice.models;

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

    private boolean isConfirmed;

    private int numberOfHours;

    @Column(name = "student_id")
    private Long studentId;
    
    @ManyToOne
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @Column(name = "section_id")
    private Long sectionId;
}

