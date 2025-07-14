package com.infinity.userservice.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.infinity.userservice.models.AuditEvent;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {

    Page<AuditEvent> findByServiceIgnoreCase(String service, Pageable pageable);

    Page<AuditEvent> findByEntityTypeIgnoreCase(String entityType, Pageable pageable);

    // you can also combine filters in custom queries...
}
