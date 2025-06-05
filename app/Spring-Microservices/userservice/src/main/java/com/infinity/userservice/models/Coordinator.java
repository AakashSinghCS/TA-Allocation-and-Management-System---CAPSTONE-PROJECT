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
@DiscriminatorValue("COORDINATOR")
public class Coordinator extends User {

    public Coordinator(String email, String firstName, String password, String lastName) {
        super(email, firstName, lastName, password);
    }
}
