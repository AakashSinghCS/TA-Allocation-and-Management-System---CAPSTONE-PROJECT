// package com.infinity.courseservice.models;

// import jakarta.persistence.Entity;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.Id;
// import jakarta.persistence.JoinColumn;
// import jakarta.persistence.ManyToOne;
// import lombok.Data;
// import lombok.NoArgsConstructor;

// @Entity
// @Data
// @NoArgsConstructor
// // @Table(name = "course_enrollment")
// public class Enrollment {

//     @Id
//     @GeneratedValue
//     private Long id;

//     private Long studentId;

//     @ManyToOne
//     @JoinColumn(name = "section_id", nullable = false)
//     private Section section; 

//     private boolean hasCompleted;

//     public Enrollment(Long studentId, Section section, boolean hasCompleted) {
//         this.studentId = studentId;
//         this.section = section;
//         this.hasCompleted = hasCompleted;
//     }
// }
