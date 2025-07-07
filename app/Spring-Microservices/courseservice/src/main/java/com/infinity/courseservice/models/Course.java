package com.infinity.courseservice.models;

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
import jakarta.validation.constraints.Pattern;
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

    @Pattern(regexp = "^[A-Z]{4}$")
    private String deptCode;

    @NotBlank @Size(max = 100)
    private String name;

    @Pattern(regexp = "^[0-9]{3}$")
    private String courseNum;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Section> sections;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CourseNeed> courseNeeds;

    public Course(String deptCode, String name, String courseNum) {
        this.deptCode = deptCode;
        this.name = name;
        this.courseNum = courseNum;
    }
}
