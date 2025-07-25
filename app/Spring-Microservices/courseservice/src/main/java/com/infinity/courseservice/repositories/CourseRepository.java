package com.infinity.courseservice.repositories;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto;
import com.infinity.courseservice.enums.SectionType;
import com.infinity.courseservice.models.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    @Query("""
                        SELECT DISTINCT new com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto(
                            s.id, c.id, c.deptCode, c.name, c.courseNum, s.section, s.semester.year, s.semester.semester, s.type, ss.day, ss.startTime, ss.endTime,
                CASE WHEN s.id IS NULL THEN true ELSE false END
                        )
                        FROM Course c
                        LEFT JOIN c.sections s
            LEFT JOIN s.semester sem
                        LEFT JOIN s.sectionSchedules ss
                        WHERE (:deptCode IS NULL OR c.deptCode = :deptCode)
                          AND (:courseNum IS NULL OR c.courseNum = :courseNum)
                          AND (:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))
                          AND (:type IS NULL OR s.type = :type)
                          AND (:year IS NULL OR sem.year = :year)
                          AND (:semester IS NULL OR sem.semester = :semester)
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
            @Param("type") SectionType type,
            @Param("day") String day,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);

    @Query("""
            SELECT c FROM Course c
            WHERE TRIM(c.deptCode) = TRIM(:deptCode)
                AND TRIM(c.courseNum) = TRIM(:courseNum)
            """)
    Optional<Course> findByDeptCodeAndCourseNum(String deptCode, String courseNum);

    @Query("SELECT DISTINCT c.deptCode FROM Course c")
    List<String> findAllUniqueDeptCode();

    @Query("SELECT DISTINCT c.courseNum FROM Course c WHERE c.deptCode = :deptCode")
    List<String> findDistinctCourseNumByDeptCode(@Param("deptCode") String deptCode);

    @Query("""
                SELECT s.section FROM Section s
                WHERE s.course.deptCode = :deptCode AND s.course.courseNum = :courseNum
            """)
    List<String> findSectionsByDeptCodeAndCourseNum(
            @Param("deptCode") String deptCode,
            @Param("courseNum") String courseNum);

    @Query("SELECT DISTINCT CAST(s.semester.year AS string) FROM Section s")
    List<String> findAllDistinctYearStrings();

    // @Query("""
    // SELECT s.semester FROM Section s
    // WHERE s.course.deptCode = :deptCode
    // AND s.course.courseNum = :courseNum
    // AND s.section = :section
    // AND s.year = :year
    // """)
    // List<String> findSemestersByDeptCodeAndCourseNumAndSectionAndYear(
    // @Param("deptCode")String deptCode,
    // @Param("courseNum")String courseNum,
    // @Param("section")String section,
    // @Param("year")String year);

    @Query("SELECT DISTINCT c.deptCode FROM Course c")
    List<String> findDistinctDeptCode();

    List<Course> findAllByDeptCode(String deptCode);

    @Query("""
                SELECT DISTINCT s.course
                FROM Section s
                JOIN s.semester sem
                WHERE sem.year = :year
                  AND sem.semester = :semester
                  AND s.course.id NOT IN (
                      SELECT cn.course.id
                      FROM CourseNeed cn
                      JOIN cn.semester csem
                      WHERE csem.year = :year
                        AND csem.semester = :semester
                  )
            """)
    List<Course> findCoursesWithoutNeedsByYearAndSemester(@Param("year") Integer year,
            @Param("semester") String semester);

    @Query("SELECT DISTINCT s.course FROM Section s WHERE s.instructorId = :instructorId")
    List<Course> findDistinctCoursesByInstructorId(@Param("instructorId") Long instructorId);

    @Query(value = """
              SELECT DISTINCT new com.infinity.courseservice.dtos.CourseDtos.CourseSectionScheduleDto(
                s.id, c.id, c.deptCode, c.name, c.courseNum,
                s.section, s.semester.year, s.semester.semester, s.type,
                ss.day, ss.startTime, ss.endTime,
                CASE WHEN s.id IS NULL THEN true ELSE false END
              )
              FROM Course c
                   LEFT JOIN c.sections s
               LEFT JOIN s.semester sem
               LEFT JOIN s.sectionSchedules ss
              WHERE (:deptCode   IS NULL OR c.deptCode   = :deptCode)
                AND (:courseNum  IS NULL OR c.courseNum  = :courseNum)
                AND (:name       IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))
                AND (:section    IS NULL OR s.section    = :section)
                AND (:year       IS NULL OR sem.year       = :year)
                AND (:semester   IS NULL OR sem.semester   = :semester)
                AND (:type       IS NULL OR s.type       = :type)
                AND (:day        IS NULL OR ss.day        = :day)
                AND (:startTime  IS NULL OR ss.startTime = :startTime)
                AND (:endTime    IS NULL OR ss.endTime   = :endTime)
            """, countQuery = """
              SELECT COUNT(DISTINCT s.id)
              FROM Course c
                   LEFT JOIN c.sections s
               LEFT JOIN s.semester sem
               LEFT JOIN s.sectionSchedules ss
              WHERE (:deptCode   IS NULL OR c.deptCode   = :deptCode)
                AND (:courseNum  IS NULL OR c.courseNum  = :courseNum)
                AND (:name       IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))
                AND (:section    IS NULL OR s.section    = :section)
                AND (:year       IS NULL OR sem.year       = :year)
                AND (:semester   IS NULL OR sem.semester   = :semester)
                AND (:type       IS NULL OR s.type       = :type)
                AND (:day        IS NULL OR ss.day        = :day)
                AND (:startTime  IS NULL OR ss.startTime = :startTime)
                AND (:endTime    IS NULL OR ss.endTime   = :endTime)
            """)
    Page<CourseSectionScheduleDto> courseFilter(
            @Param("deptCode") String deptCode,
            @Param("courseNum") String courseNum,
            @Param("name") String name,
            @Param("section") String section,
            @Param("year") Integer year,
            @Param("semester") String semester,
            @Param("type") SectionType type,
            @Param("day") String day,
            @Param("startTime") java.time.LocalTime startTime,
            @Param("endTime") java.time.LocalTime endTime,
            Pageable pageable);
}
