package com.infinity.courseservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.models.Section;
import com.infinity.courseservice.models.Course;
import com.infinity.courseservice.enums.SectionType;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {

    List<Section> findByCourseId(Long courseId);

    List<Section> findAllByInstructorId(Long instructorId);

    Optional<Section> findByCourseIdAndSemester_YearAndSemester_Semester(Long courseId, Integer year, String semester);

    Optional<Section> findByCourseIdAndSectionAndSemester_YearAndSemester_Semester(
            Long courseId, String section, Integer year, String semester);

    Optional<Section> findByCourseAndSemester_YearAndSemester_SemesterAndSectionAndType(
            Course course, Integer year, String semester, String section, SectionType type);

    List<Section> findByInstructorIdAndSemester_YearAndSemester_Semester(Long instructorId, Integer year,
            String semester);

    List<Section> findByInstructorIdAndCourseIdAndSemester_YearAndSemester_Semester(
            Long instructorId, Long courseId, Integer year, String semester);

    Optional<Section> findByCourseIdAndSection(Long courseId, String section);
}
