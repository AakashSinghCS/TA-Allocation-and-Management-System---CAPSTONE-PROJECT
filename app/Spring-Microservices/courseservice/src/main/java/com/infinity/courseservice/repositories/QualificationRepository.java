package com.infinity.courseservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.infinity.courseservice.dtos.QualificationDto;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.Qualification;

import feign.Param;

public interface QualificationRepository extends JpaRepository<Qualification, Long>{
    List<QualificationDto> findAllByStudentId(Long studentId);
    List<QualificationDto> findAllByDeptCode(String deptCode);
    List<Qualification> findAllByDescription(String description);
    void deleteAllByStudentId(Long studentId);

    @Query("SELECT q FROM Qualification q WHERE q.id IN :ids AND q.studentId IS NULL")
    List<Qualification> findAllByIdAndStudentIdIsNull(@Param("ids") List<Long> ids);

    @Query("SELECT q FROM Qualification q WHERE q.course IN :ids AND q.studentId IS NULL")
    List<QualificationDto> findAllByCourseAndStudentIdIsNull(@Param("courses") List<Course> courses);

    @Query("SELECT q FROM Qualification q WHERE q.course IN :ids AND q.studentId IS NOT NULL")
    List<QualificationDto> findAllByCourseAndStudentIdIsNotNull(@Param("courses") List<Course> courses);

    @Query("SELECT q FROM Qualification q WHERE q.description IN :descriptions AND q.studentId IS NULL")
    List<Qualification> findAllByDescriptionAndStudentIdIsNull(@Param("descriptions") List<String> descriptions);
}