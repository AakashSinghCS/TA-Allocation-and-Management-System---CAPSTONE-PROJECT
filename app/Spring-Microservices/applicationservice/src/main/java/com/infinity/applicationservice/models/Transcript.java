package com.infinity.applicationservice.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Transcript {
    
    @Id
    Long applicationId;

    String fileName;
}