package com.infinity.profileservice.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@IdClass(StudentAnswerKey.class)
public class StudentHasProfileAnswer {

    @Id private Long studentId;   
    @Id private Long answerId;   


    private String answerText;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "answerId", insertable = false, updatable = false)
    private ProfileAnswer answer;
}
