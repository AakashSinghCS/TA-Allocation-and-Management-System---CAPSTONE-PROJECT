package com.infinity.courseservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.infinity.courseservice.dtos.CourseSectionDto;
import com.infinity.courseservice.models.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("""
    SELECT DISTINCT new com.infinity.courseservice.dtos.CourseSectionDto(
        c.deptCode, c.name, c.courseNum, s.section, s.term
    )
    FROM Course c
    JOIN c.sections s
    WHERE (:deptCode IS NULL OR c.deptCode = :deptCode)
      AND (:courseNum IS NULL OR c.courseNum = :courseNum)
      AND (:name IS NULL OR c.name = :name)
      AND (:section IS NULL OR s.section = :section)
      AND (:term IS NULL OR s.term = :term)
""")
    List<CourseSectionDto> courseFilter(
        @Param("deptCode") String deptCode,
        @Param("courseNum") Integer courseNum,
        @Param("name") String name,
        @Param("section") String section,
        @Param("term") String term
    );
}
