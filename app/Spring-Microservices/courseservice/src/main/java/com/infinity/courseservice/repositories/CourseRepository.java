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
        c.deptCode, c.name, c.courseNum, s.section, s.term, s.type, ss.day, ss.startTime, ss.endTime
    )
    FROM Course c
    LEFT JOIN c.sections s
    LEFT JOIN s.sectionSchedules ss
    WHERE (:deptCode IS NULL OR c.deptCode = :deptCode)
      AND (:courseNum IS NULL OR c.courseNum = :courseNum)
      AND (:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))
      AND (:type IS NULL OR s.type = :type)
      AND (:term IS NULL OR s.term = :term)
      AND (:day IS NULL OR ss.day = :day)
      AND (:startTime IS NULL OR ss.startTime >= :startTime)
      AND (:endTime IS NULL OR ss.endTime <= :endTime)
""")
    List<CourseSectionScheduleDto> courseFilter(
        @Param("deptCode") String deptCode,
        @Param("courseNum") String courseNum,
        @Param("name") String name,
        @Param("section") String section,
        @Param("term") String term,
        @Param("type") String type,
        @Param("day") String day,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime

    );
}
