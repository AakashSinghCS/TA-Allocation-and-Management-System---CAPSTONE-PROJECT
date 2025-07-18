package com.infinity.courseservice.models;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Need {

    @Id
    @GeneratedValue
    private Long id;

    private String description;

    private int requiredGradingHours;

    private int numHoursCurrentlyAllocated;

    @OneToMany(mappedBy = "need", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseNeed> courseNeeds;

    public Need(String description, Integer requiredGradingHours, Integer numHoursCurrentlyAllocated) {
        this.description = description;
        this.requiredGradingHours = requiredGradingHours;
        this.numHoursCurrentlyAllocated = numHoursCurrentlyAllocated;
    }

}
