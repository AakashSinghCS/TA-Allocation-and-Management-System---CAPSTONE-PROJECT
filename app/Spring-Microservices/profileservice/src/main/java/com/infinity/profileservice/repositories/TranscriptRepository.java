package com.infinity.profileservice.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.infinity.profileservice.dto.TranscriptInfoDTO;
import com.infinity.profileservice.models.Transcript;

@Repository
public interface TranscriptRepository extends JpaRepository<Transcript, Long> {
    
    Optional<Transcript> findByUserId(Long userId);
    
    @Query("SELECT new com.infinity.profileservice.dto.TranscriptInfoDTO(t.id, t.userId, t.fileName, t.uploadDate, t.fileSize) " +
           "FROM Transcript t ORDER BY t.uploadDate DESC")
    List<TranscriptInfoDTO> findAllTranscriptInfo();
}
