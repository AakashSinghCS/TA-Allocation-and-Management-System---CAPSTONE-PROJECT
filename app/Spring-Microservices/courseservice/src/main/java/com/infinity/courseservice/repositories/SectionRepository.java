package com.infinity.courseservice.repositories;

import com.infinity.courseservice.models.Section;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByCourseId(Long courseId);

    List<Section> findAllByInstructorId(Long instructorId);
}
