package com.infinity.userservice.models;

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
@DiscriminatorValue("STUDENT")
public class Student extends User {

    @Column(unique = true)
    private Integer studentNumber;

    public Student(String email, String firstName, String lastName, String password, Integer studentNumber) {
        super(email, firstName, lastName, password);
        this.studentNumber = studentNumber;
    }

    @Override
    public String getRole() {
        return "ROLE_STUDENT";
    }

}
