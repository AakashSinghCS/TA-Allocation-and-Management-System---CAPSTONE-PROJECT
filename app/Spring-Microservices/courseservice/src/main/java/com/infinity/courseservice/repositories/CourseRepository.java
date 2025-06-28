package com.infinity.courseservice.repositories;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto;
import com.infinity.courseservice.models.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("""
    SELECT DISTINCT new com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto(
        s.id, c.id, c.deptCode, c.name, c.courseNum, s.section, s.year, s.semester, s.type, ss.day, ss.startTime, ss.endTime,CASE WHEN s.id IS NULL THEN true ELSE false END
    )
    FROM Course c
    LEFT JOIN c.sections s
    LEFT JOIN s.sectionSchedules ss
    WHERE (:deptCode IS NULL OR c.deptCode = :deptCode)
      AND (:courseNum IS NULL OR c.courseNum = :courseNum)
      AND (:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))
      AND (:type IS NULL OR s.type = :type)
      AND (:year IS NULL OR s.year = :year)
      AND (:semester IS NULL OR s.semester = :semester)
      AND (:day IS NULL OR ss.day = :day)
      AND (:startTime IS NULL OR ss.startTime >= :startTime)
      AND (:endTime IS NULL OR ss.endTime <= :endTime)
""")
    List<CourseSectionScheduleDto> courseFilter(
        @Param("deptCode") String deptCode,
        @Param("courseNum") String courseNum,
        @Param("name") String name,
        @Param("section") String section,
        @Param("year") Integer year,
        @Param("semester") String semester,
        @Param("type") String type,
        @Param("day") String day,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime

    );
    @Query("""
    SELECT c FROM Course c
    WHERE TRIM(c.deptCode) = TRIM(:deptCode)
        AND TRIM(c.courseNum) = TRIM(:courseNum)
    """)
    Optional<Course> findByDeptCodeAndCourseNum(String deptCode, String courseNum);
}
