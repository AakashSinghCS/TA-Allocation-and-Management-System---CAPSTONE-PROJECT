package com.infinity.userservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infinity.userservice.models.Instructor;

public interface InstructorRepository extends JpaRepository<Instructor, Long>  {
    List<Instructor> findByFirstNameIgnoreCaseContainingOrLastNameIgnoreCaseContaining(String firstName, String lastName);

    List<Instructor> findAllByEmployeeNumber(Integer employeeNumber);
}
