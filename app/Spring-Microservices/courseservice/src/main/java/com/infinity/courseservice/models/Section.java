package com.infinity.courseservice.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.infinity.courseservice.enums.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;


import lombok.NoArgsConstructor;


@Entity
@Data
@NoArgsConstructor
@Table(name = "section",
       uniqueConstraints = {
           @UniqueConstraint(
               name = "uk_section_unique_row",
               columnNames = {"term", "section", "type"})
       })
public class Section {
    @Id
    @GeneratedValue()

    private Long id;

    private String term;
    private String section;

    @Enumerated(EnumType.STRING)
    private SectionType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    public Section(String term, String section, SectionType type, Course course) {
        this.term = term;
        this.section = section;
        this.type = type;
        this.course = course;
    }

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SectionSchedule> sectionSchedules;

}
