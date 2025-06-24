package com.infinity.userservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infinity.userservice.models.Instructor;

public interface InstructorRepository extends JpaRepository<Instructor, Long>  {
    
}
