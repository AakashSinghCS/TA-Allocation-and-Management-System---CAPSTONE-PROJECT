package com.infinity.applicationservice.models;

import java.time.LocalDateTime;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrimaryKeyJoinColumn;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Data
public class Application {

    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private Long studentId;

    private boolean isAccepted;

    private String subjectPreferences;

    @Column(nullable = false)
    private boolean wantRemote;

    @Column(nullable = false)
    private Integer wantWorkingHours;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime submittedAt;

    @OneToOne(cascade = CascadeType.ALL)
    @PrimaryKeyJoinColumn
    private Transcript transcript;

    @OneToMany
    private Set<Offer> offers;

}
