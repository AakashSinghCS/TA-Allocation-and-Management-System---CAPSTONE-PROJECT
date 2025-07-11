package com.infinity.applicationservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infinity.applicationservice.models.Allocation;

import jakarta.transaction.Transactional;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Long>{

    List<Allocation> findByStudentId(Long studentId);

    boolean existsByApplicationIdAndSectionIdAndStudentId(Long applicationId, Long sectionId, Long studentId);

    boolean existsByStudentIdAndApplicationId(Long userIdFromHeader, Long appId);

    @Modifying
    @Transactional 
    @Query("update Allocation a set a.sectionId = null where a.sectionId = :sectionId")
    int clearSectionIdBySectionId(@Param("sectionId") Long sectionId);
}
