package com.infinity.courseservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.enums.EnrollmentStatus;
import com.infinity.courseservice.models.StudentCourse;

@Repository
public interface StudentCourseRepository extends JpaRepository<StudentCourse, Long>{

    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    List<StudentCourse> findAllByStudentId(Long studentId);

    List<StudentCourse> findAllByStudentIdAndStatus(Long studentId, EnrollmentStatus completed);

}
