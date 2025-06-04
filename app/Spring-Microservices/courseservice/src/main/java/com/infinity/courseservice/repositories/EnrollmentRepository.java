package com.infinity.courseservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infinity.courseservice.models.CourseEnrollment;

public interface EnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {

    List<CourseEnrollment> findAllByStudentId(Long studentId);

}
