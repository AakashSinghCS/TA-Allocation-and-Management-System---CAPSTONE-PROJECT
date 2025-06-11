package com.infinity.applicationservice.models;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Data
public class Application {

    @Id
    @GeneratedValue
    Long id;

    @Column(nullable = false)
    Integer studentNum;

    boolean isAccepted;

    String subjectPreferences;

    @Column(nullable = false)
    boolean wantRemote;

    @Column(nullable = false)
    Integer wantWorkingHours;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime submittedAt;

}
