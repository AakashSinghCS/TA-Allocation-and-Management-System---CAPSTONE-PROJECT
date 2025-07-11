package com.infinity.courseservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.enums.EnrollmentStatus;
import com.infinity.courseservice.models.StudentCourse;

import jakarta.transaction.Transactional;

@Repository
public interface StudentCourseRepository extends JpaRepository<StudentCourse, Long>{

    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    List<StudentCourse> findAllByStudentId(Long studentId);

    List<StudentCourse> findAllByStudentIdAndStatus(Long studentId, EnrollmentStatus completed);

    @Modifying
    @Transactional 
    @Query("""
      update StudentCourse sc
         set sc.section = null
       where sc.section.id = :sectionId
      """)
    int clearSectionReference(@Param("sectionId") Long sectionId);

}
