package com.infinity.profileservice.models;

import com.infinity.profileservice.enums.QuestionType;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class ProfileQuestion {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String description;

    @Enumerated(EnumType.STRING)
    private QuestionType type;
}
