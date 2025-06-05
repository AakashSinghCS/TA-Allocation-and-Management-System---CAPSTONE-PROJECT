package com.infinity.userservice.models;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@Entity
@DiscriminatorValue("I")
public class Instructor extends User {
    
    public Instructor(String email, String firstName, String lastName) {
        super(email, firstName, lastName);
    }
}
