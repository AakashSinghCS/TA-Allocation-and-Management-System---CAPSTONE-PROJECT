package com.infinity.userservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infinity.userservice.models.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentNumber(Integer studentNumber);
   
    List<Student> findAllByStudentNumber(Integer studentNumber);

    List<Student> findByFirstNameIgnoreCaseContainingOrLastNameIgnoreCaseContaining(String firstName, String lastName);
    
}
