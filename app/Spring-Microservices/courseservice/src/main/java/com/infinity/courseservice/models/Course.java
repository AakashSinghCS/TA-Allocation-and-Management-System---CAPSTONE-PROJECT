package com.infinity.courseservice.models;

import java.util.List;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
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
    private Integer courseNum;

    @ElementCollection
    private List<Long> studentIds;

    @ElementCollection
    private List<Long> instructorIds;
}
