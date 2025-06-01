package com.infinity.userservice.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class User {
    
    @Id
    @GeneratedValue
    private Long id;
    
    @Column(unique = true)
    private String email;

    private String firstName;
    private String lastName;

}
