package com.infinity.courseservice.repositories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.models.Exam;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
}
