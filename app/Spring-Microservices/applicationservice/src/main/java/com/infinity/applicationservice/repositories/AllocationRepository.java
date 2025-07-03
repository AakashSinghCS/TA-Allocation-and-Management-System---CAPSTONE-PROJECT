package com.infinity.applicationservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.applicationservice.models.Allocation;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Long>{

    List<Allocation> findByStudentId(Long studentId);

    boolean existsByApplicationIdAndSectionIdAndStudentId(Long applicationId, Long sectionId, Long studentId);
}
