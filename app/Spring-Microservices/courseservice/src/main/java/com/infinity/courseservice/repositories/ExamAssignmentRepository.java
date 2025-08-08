package com.infinity.courseservice.repositories;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.models.ExamAssignment;

@Repository
public interface ExamAssignmentRepository extends JpaRepository<ExamAssignment, Long> {
    List<ExamAssignment> findByStudentId(Long studentId);
    List<ExamAssignment> findByExamId(Long examId);
    Optional<ExamAssignment> findByExamIdAndStudentId(Long examId, Long studentId);

}
