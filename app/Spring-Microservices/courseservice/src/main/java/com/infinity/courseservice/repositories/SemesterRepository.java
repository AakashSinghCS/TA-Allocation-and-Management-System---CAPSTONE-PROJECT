package com.infinity.courseservice.repositories;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.models.Semester;

@Repository
public interface SemesterRepository extends JpaRepository<Semester, Long> {
    Optional<Semester> findByYearAndSemester(Integer year, String semester);

    List<Semester> findByStartDateAfterOrderByStartDateAsc(LocalDate date);
}
