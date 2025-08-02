package com.infinity.courseservice.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Data
@Entity
@Table(name = "student_qualification")
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) //Audting recording might not work without this.
public class StudentQualification {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "qualification_id")
    private Qualification qualification;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    public StudentQualification() {}

    public StudentQualification(Qualification qualification, Long studentId) {
        this.qualification = qualification;
        this.studentId = studentId;
    }
}
