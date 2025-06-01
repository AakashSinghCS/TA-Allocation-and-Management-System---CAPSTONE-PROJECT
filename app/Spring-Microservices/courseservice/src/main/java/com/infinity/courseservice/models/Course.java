package com.infinity.courseservice.models;

import jakarta.persistence.Column;
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

}
