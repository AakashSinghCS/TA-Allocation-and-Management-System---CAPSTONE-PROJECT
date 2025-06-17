package com.infinity.courseservice.models;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Data
@NoArgsConstructor
public class Section {
    
    @Id
    @GeneratedValue
    private Long id;

    private String term;
    private String section;
    private String type;

    @ManyToOne
    @JsonBackReference
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SectionSchedule> sectionSchedules;

    public Section(String term, String section, String type, Course course) {
        this.term = term;
        this.section = section;
        this.type = type;
        this.course = course;
    }

    // @ElementCollection
    // @CollectionTable(name = "enrollment", joinColumns = @JoinColumn(name = "section_id"))
    // @Column(name = "student_id")
    // private Set<Long> studentIds;
}
