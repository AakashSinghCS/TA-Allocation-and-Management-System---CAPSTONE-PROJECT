package com.infinity.courseservice.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.SectionSchedule;

@Repository
public interface SectionScheduleRepository extends JpaRepository<SectionSchedule, Long>{
    
    /**
     * Find all schedules for a specific section
     * @param section The section to find schedules for
     * @return List of schedules for the section
     */
    List<SectionSchedule> findBySection(Section section);
}
