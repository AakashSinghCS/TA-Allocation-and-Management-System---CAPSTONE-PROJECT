package com.infinity.courseservice.models;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.infinity.courseservice.enums.SectionType;

import jakarta.persistence.CascadeType;
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

    private Integer year;
    private String semester;
    private String section;

    private Long instructorId;

    @Enumerated(EnumType.STRING)
    private SectionType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonBackReference
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    public Section(Integer year, String semester, String section, SectionType type, Course course) {
        this.year = year;
        this.semester = semester;
        this.section = section;
        this.type = type;
        this.course = course;
    }

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SectionSchedule> sectionSchedules;

}
