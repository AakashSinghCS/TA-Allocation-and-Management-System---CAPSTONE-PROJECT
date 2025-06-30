package com.infinity.courseservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infinity.courseservice.models.Section;


public interface SectionRepository extends JpaRepository<Section, Long>{
    List<Section> findByInstructorId(Long instructorId);
}
