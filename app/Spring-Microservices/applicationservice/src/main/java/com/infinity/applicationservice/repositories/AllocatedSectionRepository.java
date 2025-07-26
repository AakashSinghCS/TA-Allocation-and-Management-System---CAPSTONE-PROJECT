package com.infinity.applicationservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.applicationservice.enums.TaskType;
import com.infinity.applicationservice.models.AllocatedSection;

@Repository
public interface AllocatedSectionRepository extends JpaRepository<AllocatedSection, Long> {
    void deleteById(Long id);

    boolean existsBySectionIdAndAllocationIdAndTask(Long sectionId, Long studentId, TaskType task);

    Optional<AllocatedSection> findById(Long id);

    List<AllocatedSection> findAllBySectionId(Long sectionId);

    Integer deleteAllBySectionId(Long sectionId);

}
