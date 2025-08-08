package com.infinity.profileservice.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Data
// @IdClass(StudentAnswerKey.class)
@Table(
  name = "student_has_profile_answer",
  uniqueConstraints = @UniqueConstraint(
    name = "uq_student_answer",
    columnNames = {"student_id", "answer_id"}
  )
)
@ToString(exclude = {"answer"})
@EqualsAndHashCode(exclude = {"answer"})
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) //Audting recording might not work without this.
public class StudentHasProfileAnswer {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @Id private Long studentId;   
    // @Id private Long answerId;   

    @Column(name="student_id", nullable=false)
    private Long studentId;

    @Column(name="answer_id", nullable=false)
    private Long answerId;

    private String answerText;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answer_id", insertable = false, updatable = false)
    private ProfileAnswer answer;
}
