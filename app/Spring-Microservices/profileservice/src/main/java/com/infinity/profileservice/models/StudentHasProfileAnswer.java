package com.infinity.profileservice.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@IdClass(StudentAnswerKey.class)
public class StudentHasProfileAnswer {

    @Id private Integer studentId;   // PK + FK → userservice.student.id
    @Id private Integer answerId;    // PK + FK → profile_answer.id

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answerId", insertable = false, updatable = false)
    private ProfileAnswer answer;
}
