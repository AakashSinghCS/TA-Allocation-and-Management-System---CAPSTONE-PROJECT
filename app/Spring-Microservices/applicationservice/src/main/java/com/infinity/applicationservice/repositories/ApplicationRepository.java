package com.infinity.applicationservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.applicationservice.models.Application;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long>{

    void deleteByStudentId(Long studentId);

    boolean existsByStudentId(Long studentId);
    
}
