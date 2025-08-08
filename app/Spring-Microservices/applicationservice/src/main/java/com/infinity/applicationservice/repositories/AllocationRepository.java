package com.infinity.applicationservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.applicationservice.models.Allocation;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Long>{

    Allocation findByStudentId(Long studentId);

    boolean existsByApplicationId(Long applicationId);

    boolean existsByStudentIdAndApplicationId(Long userIdFromHeader, Long appId);

    // @Modifying
    // @Transactional 
    // @Query("update Allocation a set a.sectionId = null where a.sectionId = :sectionId")
    // int clearSectionIdBySectionId(@Param("sectionId") Long sectionId);

    Allocation findByApplicationId(Long appId);
}
