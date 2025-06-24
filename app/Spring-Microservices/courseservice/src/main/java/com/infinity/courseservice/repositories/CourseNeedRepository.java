package com.infinity.courseservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.models.CourseNeed;

@Repository
public interface CourseNeedRepository extends JpaRepository<CourseNeed, Long> {
    List<CourseNeed> findByCourseId(Long courseId);
}
