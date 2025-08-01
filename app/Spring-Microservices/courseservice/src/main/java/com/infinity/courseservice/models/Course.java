package com.infinity.courseservice.models;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString; 


@Entity
@Data
@NoArgsConstructor
@Table(name = "course",
       uniqueConstraints = {
           @UniqueConstraint(
               name = "uk_course_unique_row",
               columnNames = {"deptCode", "name", "courseNum"})
       })
@ToString(exclude = {"sections","courseNeeds","studentCourses","studentTaughtCourses"})
@EqualsAndHashCode(exclude = {"sections","courseNeeds","studentCourses","studentTaughtCourses"})
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) //Audting recording might not work without this.
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

    public Course(Course other){
        this.id = other.id;
        this.deptCode = other.deptCode;
        this.name = other.name;
        this.courseNum = other.courseNum;
        this.sections = (other.sections == null ? List.<Section>of() : other.sections)
            .stream()
            .map(Section::new)   
            .collect(Collectors.toList());
        
        this.courseNeeds = (other.courseNeeds == null ? List.<CourseNeed>of() : other.courseNeeds)
            .stream()
        .map(CourseNeed::new)   
        .collect(Collectors.toList());
        // this.studentCourses = other.studentCourses.stream()
        // .map(StudentCourse::new)   
        // .collect(Collectors.toList());
        this.studentTaughtCourses = (other.studentTaughtCourses == null ? List.<StudentTaughtCourse>of() : other.studentTaughtCourses)
            .stream()
        .map(StudentTaughtCourse::new)   
        .collect(Collectors.toList()); 
    }
    public Course(Optional<Course> other) {
    if (other.isPresent()) {
        Course course = other.get();
        this.id = course.getId();
        this.deptCode = course.getDeptCode();
        this.name = course.getName();
        this.courseNum = course.getCourseNum();
        this.sections = (course.getSections() == null ? List.<Section>of() : course.getSections())
            .stream()
            .map(Section::new)   
            .collect(Collectors.toList());
        this.courseNeeds = (course.getCourseNeeds() == null ? List.<CourseNeed>of() : course.getCourseNeeds())
            .stream()
        .map(CourseNeed::new)   
        .collect(Collectors.toList());
        // this.studentCourses = other.studentCourses.stream()
        // .map(StudentCourse::new)   
        // .collect(Collectors.toList());
        this.studentTaughtCourses = (course.getStudentTaughtCourses() == null ? List.<StudentTaughtCourse>of() : course.getStudentTaughtCourses())
            .stream()
        .map(StudentTaughtCourse::new)   
        .collect(Collectors.toList()); 
    }
}
}
