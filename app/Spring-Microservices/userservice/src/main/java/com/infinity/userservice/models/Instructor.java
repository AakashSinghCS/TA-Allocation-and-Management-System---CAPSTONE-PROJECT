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
@DiscriminatorValue("INSTRUCTOR")
public class Instructor extends User {
    
    public Instructor(String email, String firstName, String lastName, String password) {
        super(email, firstName, lastName, password);
    }

    @Override
    public String getRole() {
        return "ROLE_INSTRUCTOR";
    }
}
