package com.infinity.profileservice.repositories;

import com.infinity.profileservice.models.ProfileAnswer;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswerRepo extends JpaRepository<ProfileAnswer, Long> {
    List<ProfileAnswer> findByQuestionId(Long questionId);
}

