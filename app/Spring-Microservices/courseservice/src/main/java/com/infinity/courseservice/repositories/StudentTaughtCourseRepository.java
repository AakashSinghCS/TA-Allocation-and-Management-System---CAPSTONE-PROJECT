package com.infinity.courseservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.models.StudentTaughtCourse;

@Repository
public interface StudentTaughtCourseRepository extends JpaRepository<StudentTaughtCourse, Long> {
    List<StudentTaughtCourse> findByStudentId(Long studentId);
    // StudentTaughtCourse deleteByStudentIdAndCourseId(Long studentId, Long courseId);
    StudentTaughtCourse findByStudentIdAndCourseId(Long studentId, Long courseId);

    List<StudentTaughtCourse> findAllByStudentIdAndCourse_IdAndSemester_SemesterAndSemester_Year(
        Long studentId,
        Long courseId,
        String semesterName,
        Integer year
    );
}
