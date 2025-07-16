package com.infinity.userservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.infinity.userservice.models.AuditEvent;

public interface AuditRepository extends JpaRepository<AuditEvent, Long>,JpaSpecificationExecutor<AuditEvent> {

}
