package com.infinity.courseservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.models.CourseNeed;
import com.infinity.courseservice.models.Semester;

@Repository
public interface CourseNeedRepository extends JpaRepository<CourseNeed, Long> {
    List<CourseNeed> findByCourseId(Long courseId);

    Optional<CourseNeed> findByCourseIdAndSemester_YearAndSemester_Semester(Long courseId, Integer year, String semester);

    boolean existsByCourseAndSemester(Course course, Semester semester);
}
