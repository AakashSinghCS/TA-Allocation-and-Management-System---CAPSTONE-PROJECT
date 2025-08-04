package com.infinity.applicationservice.models;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.infinity.applicationservice.dtos.Applications.ApplicationRequest;
import com.infinity.applicationservice.enums.ApplicationType;
import com.infinity.applicationservice.enums.Subject;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Data
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = { "studentId", "year", "semester" }) })
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) //Audting recording might not work without this.
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long studentId;

    private boolean isAccepted;

    @Enumerated(EnumType.STRING)
    private Subject subjectPreference1;

    @Enumerated(EnumType.STRING)
    private Subject subjectPreference2;

    @Enumerated(EnumType.STRING)
    private Subject subjectPreference3;

    @Enumerated(EnumType.STRING)
    private ApplicationType applicationType;

    @Column(nullable = false)
    private boolean wantRemote;

    @Column(nullable = false)
    private Integer wantWorkingHours;

    @Column(nullable = false)
    @CreationTimestamp
    private LocalDateTime submittedAt;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private String semester;

     @OneToOne(mappedBy = "application", 
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private Allocation allocations;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Unavailability> unavailabilities = new HashSet<>();

    public Application(Long studentId, List<Subject> preferences, ApplicationType applicationType, boolean wantRemote, Integer wantWorkingHours,
            Integer year, String semester) {
        this.studentId = studentId;
        this.subjectPreference1 = preferences.size() > 0 ? preferences.get(0) : null;
        this.subjectPreference2 = preferences.size() > 1 ? preferences.get(1) : null;
        this.subjectPreference3 = preferences.size() > 2 ? preferences.get(2) : null;
        this.applicationType = applicationType;
        this.wantRemote = wantRemote;
        this.wantWorkingHours = wantWorkingHours;
        this.isAccepted = false;
        this.year = year;
        this.semester = semester;
    }
    
    public void setSubjectPreferences(ApplicationRequest req) {
        List<Subject> preferences = req.preferences();
        this.setSubjectPreference1(preferences.size() > 0 ? preferences.get(0) : null);
        this.setSubjectPreference2(preferences.size() > 1 ? preferences.get(1) : null);
        this.setSubjectPreference3(preferences.size() > 2 ? preferences.get(2) : null);
    }
    
    public List<Subject> getSubjectPreferences() {
        return Arrays.asList(this.getSubjectPreference1(), this.getSubjectPreference2(),
                this.getSubjectPreference3());
    }  

    public Application(Long applicationId, Long studentId, List<Subject> preferences, 
        ApplicationType applicationType, boolean wantRemote, 
        Integer wantWorkingHours, LocalDateTime year,Set<Unavailability> unavailabilities) {
        this.studentId = studentId;
        this.subjectPreference1 = preferences.size() > 0 ? preferences.get(0) : null;
        this.subjectPreference2 = preferences.size() > 1 ? preferences.get(1) : null;
        this.subjectPreference3 = preferences.size() > 2 ? preferences.get(2) : null;
        this.applicationType = applicationType;
        this.wantRemote = wantRemote;
        this.wantWorkingHours = wantWorkingHours;
        this.isAccepted = false;
        this.year = year.getYear();
        this.unavailabilities = unavailabilities;
    }

    public Application(Application other){
        this.id = other.id;
        this.studentId = other.studentId;
        this.subjectPreference1 = other.subjectPreference1;
        this.subjectPreference2 = other.subjectPreference2;
        this.subjectPreference3 = other.subjectPreference3;
        this.applicationType = other.applicationType;
        this.wantRemote = other.wantRemote;
        this.wantWorkingHours = other.wantWorkingHours;
        this.isAccepted = other.isAccepted;
        this.year = other.year;
        this.semester = other.semester;
        this.submittedAt= other.submittedAt;
        this.unavailabilities = (other.unavailabilities == null ? List.<Unavailability>of() : other.unavailabilities)
            .stream()
            .map(Unavailability::new)   
            .collect(Collectors.toSet());
    }
}
