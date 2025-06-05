package com.infinity.userservice.models;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Inheritance
@DiscriminatorColumn(name = "user_type")
public class User {
    
    @Id
    @GeneratedValue
    private Long id;
    
    @Column(unique = true)
    private String email;

    private String firstName;
    private String lastName;

    public User(String email, String firstName, String lastName) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
    }

}
