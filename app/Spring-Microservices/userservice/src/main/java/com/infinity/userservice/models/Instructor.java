package com.infinity.userservice.models;

import com.infinity.userservice.enums.UserRole;

import jakarta.persistence.Column;
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

    @Column(unique = true)
    private Integer employeeNum;
    private String department;
    
    public Instructor(String email, String firstName, String lastName, String password) {
        super(email, firstName, lastName, password, UserRole.INSTRUCTOR);
    }

    @Override
    public String getRole() {
        return "ROLE_INSTRUCTOR";
    }
}
