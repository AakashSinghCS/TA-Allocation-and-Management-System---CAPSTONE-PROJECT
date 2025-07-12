package com.infinity.courseservice.models;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor; 


@Entity
@Data
@NoArgsConstructor
@Table(name = "course",
       uniqueConstraints = {
           @UniqueConstraint(
               name = "uk_course_unique_row",
               columnNames = {"deptCode", "name", "courseNum"})
       })
public class Course {
    
    @Id
    @GeneratedValue
    private Long id;

    private String deptCode;

    private String name;


    private String courseNum;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Section> sections;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseNeed> courseNeeds;

    @OneToMany( mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentCourse> studentCourses = new ArrayList<>();

    @OneToMany( mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentTaughtCourse> studentTaughtCourses = new ArrayList<>();

    public Course(String deptCode, String name, String courseNum) {
        this.deptCode = deptCode;
        this.name = name;
        this.courseNum = courseNum;
    }
}
