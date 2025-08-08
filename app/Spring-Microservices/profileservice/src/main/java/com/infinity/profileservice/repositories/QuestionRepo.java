package com.infinity.profileservice.repositories;

import com.infinity.profileservice.models.ProfileQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepo extends JpaRepository<ProfileQuestion, Long> {
    
}
