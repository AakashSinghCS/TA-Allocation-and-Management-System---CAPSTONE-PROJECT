package com.infinity.courseservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infinity.courseservice.models.Course;

public interface CourseRepository extends JpaRepository<Course, Long> {
    
}
