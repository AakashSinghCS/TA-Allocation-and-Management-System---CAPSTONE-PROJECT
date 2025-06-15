package com.infinity.profileservice.repositories;

import com.infinity.profileservice.models.ProfileAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnswerRepo extends JpaRepository<ProfileAnswer, Integer> {
    
}

