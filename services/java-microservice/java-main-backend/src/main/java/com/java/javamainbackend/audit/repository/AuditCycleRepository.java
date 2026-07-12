package com.java.javamainbackend.audit.repository;

import com.java.javamainbackend.audit.entity.AuditCycle;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditCycleRepository extends JpaRepository<AuditCycle, UUID> {

    Optional<AuditCycle> findByIdAndOrganizationId(UUID id, UUID organizationId);

    Page<AuditCycle> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId, Pageable pageable);
}
