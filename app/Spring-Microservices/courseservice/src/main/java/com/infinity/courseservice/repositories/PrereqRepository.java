package com.infinity.courseservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infinity.courseservice.models.Prereq;

public interface PrereqRepository extends JpaRepository<Prereq, Long> {
    // void deleteByCourseNeed(CourseNeed courseNeed);
}
