package com.infinity.applicationservice.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Allocation {
    
    @Id
    @GeneratedValue
    private Long id;

    private Long studentId;

    private Long sectionId;

    private boolean isConfirmed;
}
