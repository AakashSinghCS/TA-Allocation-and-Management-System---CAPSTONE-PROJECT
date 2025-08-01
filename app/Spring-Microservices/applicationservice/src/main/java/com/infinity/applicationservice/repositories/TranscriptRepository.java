package com.infinity.applicationservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.infinity.applicationservice.dto.TranscriptInfoDTO;
import com.infinity.applicationservice.models.Transcript;

@Repository
public interface TranscriptRepository extends JpaRepository<Transcript, Long> {
    
    Optional<Transcript> findByApplicationId(Long applicationId);
    
    boolean existsByApplicationId(Long applicationId);
    
    @Query("SELECT new com.infinity.applicationservice.dto.TranscriptInfoDTO(" +
           "t.id, " +
           "COALESCE(a.studentId, t.userId), " +
           "t.fileName, " +
           "t.uploadDate, " +
           "t.fileSize, " +
           "t.contentType) " +
           "FROM Transcript t " +
           "LEFT JOIN t.application a " +
           "ORDER BY t.uploadDate DESC")
    List<TranscriptInfoDTO> findAllTranscriptInfo();
    
    @Query("SELECT t FROM Transcript t WHERE t.userId = :userId")
    Optional<Transcript> findByUserId(@Param("userId") Long userId);
}
