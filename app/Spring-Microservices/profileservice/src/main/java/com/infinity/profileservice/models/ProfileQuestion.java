package com.infinity.profileservice.models;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.infinity.profileservice.enums.QuestionType;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@ToString(exclude = {"answers"})  
@EqualsAndHashCode(exclude = {"answers"})
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) //Audting recording might not work without this.
public class ProfileQuestion {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    @Enumerated(EnumType.STRING)
    private QuestionType type;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<ProfileAnswer> answers = new ArrayList<>();

    public ProfileQuestion(ProfileQuestion other){
        this.id = other.id;
        this.description = other.description;
        this.type = other.type;
        this.answers =(other.answers == null ? List.<ProfileAnswer>of() : other.answers)
            .stream()
            .map(ProfileAnswer::new)   
            .collect(Collectors.toList());
    }
}
