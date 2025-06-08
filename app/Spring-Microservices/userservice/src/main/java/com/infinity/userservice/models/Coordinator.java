package com.infinity.userservice.models;

import com.infinity.userservice.enums.UserRole;

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

    public Coordinator(String email, String firstName, String lastName, String password) {
        super(email, firstName, lastName, password, UserRole.COORDINATOR);
    }

    @Override
    public String getRole() {
        return "ROLE_COORDINATOR";
    }
}
