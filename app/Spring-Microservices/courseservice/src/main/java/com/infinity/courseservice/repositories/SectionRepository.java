package com.infinity.courseservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.models.Section;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByCourseId(Long courseId);

    List<Section> findAllByInstructorId(Long instructorId);

    Optional<Section> findByCourseIdAndYearAndSemester(Long courseId, Integer year, String semester);
}
