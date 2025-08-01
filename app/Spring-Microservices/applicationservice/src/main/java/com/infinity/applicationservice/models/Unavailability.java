package com.infinity.applicationservice.models;

import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.infinity.applicationservice.enums.Day;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = "application")
@EqualsAndHashCode(exclude = "application")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) //Audting recording might not work without this.
public class Unavailability {

    @Id
    @GeneratedValue
    Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Day day;

    @Column(nullable = false)
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @Column(nullable = false)
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    @ManyToOne
    @JoinColumn(name = "application_id", nullable = false)
    @JsonBackReference("app-avail")
    private Application application;

    public Unavailability(Day day, LocalTime startTime, LocalTime endTime, Application application){
        this.day = day;
        this.startTime =startTime;
        this.endTime= endTime;
        this.application = application;
    }

    public Unavailability(Unavailability other) {
        this.id        = other.id;
        this.day       = other.day;
        this.startTime = other.startTime;
        this.endTime   = other.endTime;
        this.application = other.application;
    }
}
