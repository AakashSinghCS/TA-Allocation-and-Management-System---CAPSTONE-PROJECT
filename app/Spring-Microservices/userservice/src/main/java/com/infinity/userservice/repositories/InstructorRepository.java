package com.infinity.userservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.userservice.models.Instructor;
@Repository
public interface InstructorRepository extends JpaRepository<Instructor, Long>  {
    List<Instructor> findByFirstNameIgnoreCaseContainingOrLastNameIgnoreCaseContaining(String firstName, String lastName);

    List<Instructor> findAllByEmployeeNumber(Integer employeeNumber);
}
