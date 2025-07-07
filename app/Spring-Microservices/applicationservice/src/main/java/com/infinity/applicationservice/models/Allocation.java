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

    @Column(name = "section_id")
    private Long sectionId;
}

