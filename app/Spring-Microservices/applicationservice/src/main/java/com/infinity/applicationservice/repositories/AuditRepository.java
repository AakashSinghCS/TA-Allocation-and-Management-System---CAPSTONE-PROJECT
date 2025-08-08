package com.infinity.applicationservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.infinity.applicationservice.models.AuditEvent;

public interface AuditRepository extends JpaRepository<AuditEvent, Long>,JpaSpecificationExecutor<AuditEvent> {

}
