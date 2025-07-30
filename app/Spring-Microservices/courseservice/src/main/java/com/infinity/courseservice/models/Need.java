package com.infinity.courseservice.models;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Data
@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
// @EqualsAndHashCode(exclude = "courseNeeds") 
// @ToString(exclude = "courseNeeds") //StackOverFlow error in testing without this (Audit)
public class Need {

    @Id
    @GeneratedValue
    private Long id;

    private String description;

    private int requiredGradingHours;

    private int numHoursCurrentlyAllocated;

    @OneToMany(mappedBy = "need", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<CourseNeed> courseNeeds;

    public Need(String description, Integer requiredGradingHours, Integer numHoursCurrentlyAllocated) {
        this.description = description;
        this.requiredGradingHours = requiredGradingHours;
        this.numHoursCurrentlyAllocated = numHoursCurrentlyAllocated;
    }

    public Need(Need other){
        this.id = other.id;
        this.description = other.description;
        this.requiredGradingHours = other.requiredGradingHours;
        this.numHoursCurrentlyAllocated = other.numHoursCurrentlyAllocated;
        this.courseNeeds = other.courseNeeds;
    }

}
