package com.infinity.courseservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.courseservice.models.Need;

@Repository
public interface NeedRepository extends JpaRepository<Need, Long> {

}
