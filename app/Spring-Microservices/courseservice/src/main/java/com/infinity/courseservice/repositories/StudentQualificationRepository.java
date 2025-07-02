package com.infinity.courseservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infinity.courseservice.models.Qualification;
import com.infinity.courseservice.models.StudentQualification;

public interface StudentQualificationRepository extends JpaRepository<StudentQualification, Long> {

    List<StudentQualification> findAllByStudentId(Long studentId);
    void deleteAllByStudentId(Long studentId);
    List<StudentQualification> findAllByQualificationIn(List<Qualification> qualifications);

}
