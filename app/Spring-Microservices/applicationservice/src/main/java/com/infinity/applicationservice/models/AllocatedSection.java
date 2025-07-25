package com.infinity.applicationservice.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.infinity.applicationservice.enums.TaskType;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class AllocatedSection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "allocation_id")
    private Allocation allocation;

    private Long sectionId;

    private TaskType task;

    private double hours;
}
