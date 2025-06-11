package com.infinity.applicationservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infinity.applicationservice.models.Application;

public interface ApplicationRepository extends JpaRepository<Long, Application>{
    
}
