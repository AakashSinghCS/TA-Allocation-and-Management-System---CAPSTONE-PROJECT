package com.infinity.courseservice.models;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Data
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(uniqueConstraints = @UniqueConstraint(columnNames = { "course_id", "need_id", "semester_id" }))
@EqualsAndHashCode(exclude = {"need", "prerequisites"}) 
@ToString(exclude = {"need", "prerequisites"}) //StackOverFlow error in testing without this (Audit)
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) //Audting recording might not work without this.
public class CourseNeed {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(optional = false)
    @JoinColumn(name = "need_id")
    @JsonBackReference
    private Need need;

    @ManyToOne(optional = false)
    @JoinColumn(name = "semester_id")
    private Semester semester;

    @OneToMany(mappedBy = "courseNeed", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Prereq> prerequisites = new ArrayList<>();


    public CourseNeed(Course course, Need need, Semester semester) {
        this.course = course;
        this.need = need;
        this.semester = semester;
    }

    public CourseNeed(CourseNeed other){
        this.id = other.id;
        this.course = other.course;
        this.need = other.need;
        this.semester = other.semester;
        this.prerequisites = (other.prerequisites == null ? List.<Prereq>of() : other.prerequisites)
            .stream()
            .map(Prereq::new)   
            .collect(Collectors.toList());
    }
}
