package com.infinity.courseservice.models;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Data;
import lombok.NoArgsConstructor; // I need these extra imports to avoid error


@Entity
@Data
@NoArgsConstructor
public class Course {
    
    @Id
    @GeneratedValue
    private Long id;

    private String deptCode;
    private String name;
    private Integer courseNum;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Section> sections;

    public Course(String deptCode, String name, Integer courseNum) {
        this.deptCode = deptCode;
        this.name = name;
        this.courseNum = courseNum;
    }
}
