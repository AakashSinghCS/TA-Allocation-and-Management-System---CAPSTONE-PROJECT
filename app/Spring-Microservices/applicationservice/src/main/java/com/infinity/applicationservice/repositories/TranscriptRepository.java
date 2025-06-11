package com.infinity.applicationservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.applicationservice.models.Transcript;

@Repository
public interface TranscriptRepository extends JpaRepository<Transcript, Long> {

}
