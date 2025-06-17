package com.infinity.courseservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infinity.courseservice.models.SectionSchedule;

public interface SectionScheduleRepository extends JpaRepository<SectionSchedule, Long>{
    
}
