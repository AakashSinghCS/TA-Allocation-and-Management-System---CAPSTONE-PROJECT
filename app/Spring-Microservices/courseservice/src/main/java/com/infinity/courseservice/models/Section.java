package com.infinity.courseservice.models;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.infinity.courseservice.enums.SectionType;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "section", uniqueConstraints = {
        @UniqueConstraint(name = "uk_section_unique_row", 
                columnNames = { "course_id", "semester_id", "section","type" })
})
public class Section {
    @Id
    @GeneratedValue()

    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "semester_id")
    private Semester semester;

    private String section;

    private Long instructorId;

    @Column(nullable = false)
    private int numberOfTAsAllocated = 0;

    @Enumerated(EnumType.STRING)
    private SectionType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    public Section(Semester semester, String section, SectionType type, Course course, Long instructorId) {
        this.semester = semester;
        this.section = section;
        this.type = type;
        this.course = course;
        this.instructorId = instructorId;
    }

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SectionSchedule> sectionSchedules;

    public Section(Semester semester, String section, SectionType type, Long instructorId, Course course) {
        this.semester = semester;
        this.section = section;
        this.type = type;
        this.instructorId = instructorId;
        this.course = course;
    }

    public Section(Section other){
        this.id = other.id;
        this.semester= other.semester;
        this.section = other.section;
        this.instructorId= other.instructorId;
        this.type = other.type;
        this.course = other.course;
    }
}
