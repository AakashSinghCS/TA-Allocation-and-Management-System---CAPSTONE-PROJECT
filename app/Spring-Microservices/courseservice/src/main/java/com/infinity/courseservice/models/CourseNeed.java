package com.infinity.courseservice.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(uniqueConstraints = @UniqueConstraint(columnNames = { "course_id", "need_id", "year", "semester" }))
public class CourseNeed {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(optional = false)
    @JoinColumn(name = "need_id")
    private Need need;

    private Integer year;

    private String semester;

    public CourseNeed(Course course, Need need, Integer year, String semester) {
        this.course = course;
        this.need = need;
        this.year = year;
        this.semester = semester;
    }
}
