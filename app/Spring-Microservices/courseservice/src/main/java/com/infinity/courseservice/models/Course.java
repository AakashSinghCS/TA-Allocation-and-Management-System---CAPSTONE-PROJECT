package com.infinity.courseservice.models;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany; // I need these extra imports to avoid error 
import lombok.Data;
import lombok.NoArgsConstructor;


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
    private List<Section> sections;

    public Course(String deptCode, String name, Integer courseNum) {
        this.deptCode = deptCode;
        this.name = name;
        this.courseNum = courseNum;
    }
}
