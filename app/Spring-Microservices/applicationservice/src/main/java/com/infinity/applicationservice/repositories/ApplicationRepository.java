package com.infinity.applicationservice.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.applicationservice.models.Application;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long>{

    void deleteByStudentIdAndYear(Long studentId, Integer year);

    boolean existsByStudentIdAndYear(Long studentId, Integer year);

    Optional<Application> findByStudentIdAndYear(Long studentId, Integer year);
    
}
