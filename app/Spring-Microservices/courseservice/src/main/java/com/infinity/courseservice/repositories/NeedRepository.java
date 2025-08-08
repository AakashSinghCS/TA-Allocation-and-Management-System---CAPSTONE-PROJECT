package com.infinity.courseservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.models.Need;

import jakarta.transaction.Transactional;

@Repository
public interface NeedRepository extends JpaRepository<Need, Long> {

    @Modifying
    @Transactional
    @Query("UPDATE Need n SET n.numHoursCurrentlyAllocated = :numHoursCurrentlyAllocated WHERE n.id = :needId")
    void updateNeedAllocatedHours(@Param("needId") Long needId,
            @Param("numHoursCurrentlyAllocated") Integer numHoursCurrentlyAllocated);
}
