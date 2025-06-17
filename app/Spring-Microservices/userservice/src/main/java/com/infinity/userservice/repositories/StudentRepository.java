package com.infinity.userservice.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infinity.userservice.models.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentNum(Integer studentNumber);
    
}
