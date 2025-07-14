package com.infinity.courseservice.repositories;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.models.ExamAvailability;

@Repository
public interface ExamAvailabilityRepository extends JpaRepository<ExamAvailability, Long> {
    List<ExamAvailability> findByStudentId(Long studentId);
    void deleteByStudentId(Long studentId);
}