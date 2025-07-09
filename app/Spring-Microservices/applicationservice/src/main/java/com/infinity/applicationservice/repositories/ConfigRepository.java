package com.infinity.applicationservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.infinity.applicationservice.models.GlobalDeadline;

public interface ConfigRepository extends JpaRepository<GlobalDeadline, Long> {
    GlobalDeadline findByName(String name);
}
