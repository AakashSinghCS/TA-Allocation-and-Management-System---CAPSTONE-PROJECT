package com.infinity.courseservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.models.SectionSchedule;

@Repository
public interface SectionScheduleRepository extends JpaRepository<SectionSchedule, Long>{
    
}
