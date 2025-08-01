package com.infinity.applicationservice.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.infinity.applicationservice.enums.TaskType;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(
    name = "allocated_section",
    uniqueConstraints = @UniqueConstraint(columnNames = {"allocation_id", "sectionId", "task"})
)
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) //Audting recording might not work without this.
public class AllocatedSection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "allocation_id")
    private Allocation allocation;

    private Long sectionId;

    @Enumerated(EnumType.STRING)
    private TaskType task;

    private double hours;

    public AllocatedSection(AllocatedSection other){
        this.id = other.id;
        this.allocation = other.allocation;
        this.sectionId= other.sectionId;
        this.task = other.task;
        this.hours= other.hours;
    }
}
