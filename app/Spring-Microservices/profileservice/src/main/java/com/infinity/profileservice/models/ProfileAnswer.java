package com.infinity.profileservice.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@ToString(exclude = {"question"})
@EqualsAndHashCode(exclude = {"question"})
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" }) // helps the DELETE get recorded in ProfileService.
public class ProfileAnswer {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    @JsonBackReference
    private ProfileQuestion question;       

    private String description;

    public ProfileAnswer(ProfileAnswer other){
        this.id = other.id;
        this.question = other.question;
        this.description=other.description;
    }
}
