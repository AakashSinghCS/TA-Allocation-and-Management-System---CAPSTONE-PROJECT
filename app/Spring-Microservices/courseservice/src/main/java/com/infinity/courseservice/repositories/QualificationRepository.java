package com.infinity.courseservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Qualification;

import feign.Param;

public interface QualificationRepository extends JpaRepository<Qualification, Long>{
    
    
    List<Qualification> findByDescription(String description);
    

    // @Query("SELECT q FROM Qualification q WHERE q.id IN :ids AND q.studentId IS NULL")
    // List<Qualification> findAllByIdAndStudentIdIsNull(@Param("ids") List<Long> ids);

    @Query("SELECT q FROM Qualification q WHERE q.course = :course")
    Qualification findByCourse(@Param("course") Course course);

    @Query("SELECT q FROM Qualification q WHERE q.deptCode = :deptCode")
    List<Qualification> findAllByDeptCode(String deptCode);

    // @Query("SELECT q FROM Qualification q WHERE q.course IN :courses AND q.studentId IS NOT NULL")
    // List<Qualification> findAllByCourseAndStudentIdIsNotNull(@Param("courses") List<Course> courses);

    @Query("SELECT q FROM Qualification q WHERE q.description IN :descriptions")
    List<Qualification> findAllByDescription(@Param("descriptions") List<String> descriptions);

    @Query("SELECT q FROM Qualification q WHERE q.id IN :ids")
    List<Qualification> findAllByIds(@Param("ids") List<Long> ids);
}