package com.infinity.courseservice.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) //Audting recording might not work without this.
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

    public Prereq(Prereq other){
        this.id = other.id;
        this.courseNeed = other.courseNeed;
        this.prerequisite= other.prerequisite;
    }
}
