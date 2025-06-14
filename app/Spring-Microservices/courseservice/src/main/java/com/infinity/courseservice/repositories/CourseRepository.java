package com.infinity.courseservice.repositories;

import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.infinity.courseservice.dtos.CourseSectionScheduleDto;
import com.infinity.courseservice.models.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("""
    SELECT DISTINCT new com.infinity.courseservice.dtos.CourseSectionScheduleDto(
        c.deptCode, c.name, c.courseNum, s.section, s.term, ss.day, ss.startTime, ss.endTime
    )
    FROM Course c
    JOIN c.sections s
    JOIN s.sectionSchedules ss
    WHERE (:deptCode IS NULL OR c.deptCode = :deptCode)
      AND (:courseNum IS NULL OR c.courseNum = :courseNum)
      AND (:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))
      AND (:section IS NULL OR s.section = :section)
      AND (:term IS NULL OR s.term = :term)
      AND (:day IS NULL OR ss.day = :day)
      AND (:startTime IS NULL OR ss.startTime >= :startTime)
      AND (:endTime IS NULL OR ss.endTime <= :endTime)
""")
    List<CourseSectionScheduleDto> courseFilter(
        @Param("deptCode") String deptCode,
        @Param("courseNum") Integer courseNum,
        @Param("name") String name,
        @Param("section") String section,
        @Param("term") String term,
        @Param("day") String day,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime

    );
}
