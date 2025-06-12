package com.infinity.profileservice.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@IdClass(StudentAnswerKey.class)
public class StudentHasProfileAnswer {

    @Id private Integer studentId;   // PK + FK → userservice.student.id
    @Id private Integer answerId;    // PK + FK → profile_answer.id

    /** Only used if the question type is FREE_TEXT */
    private String answerText;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answerId", insertable = false, updatable = false)
    private ProfileAnswer answer;
}
