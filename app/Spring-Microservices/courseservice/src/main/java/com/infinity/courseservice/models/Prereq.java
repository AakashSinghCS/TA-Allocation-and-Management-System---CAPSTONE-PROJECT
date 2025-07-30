package com.infinity.courseservice.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(uniqueConstraints = {
        @UniqueConstraint(columnNames = { "course_need_id", "prerequisite_id" })
})
public class Prereq {

    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "course_need_id")
    @JsonBackReference
    private CourseNeed courseNeed;

    @ManyToOne(optional = false)
    @JoinColumn(name = "prerequisite_id")
    private Course prerequisite;
}
