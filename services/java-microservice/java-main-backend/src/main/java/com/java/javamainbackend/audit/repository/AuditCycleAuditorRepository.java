package com.java.javamainbackend.audit.repository;

import com.java.javamainbackend.audit.entity.AuditCycleAuditor;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditCycleAuditorRepository extends JpaRepository<AuditCycleAuditor, UUID> {

    List<AuditCycleAuditor> findByCycleId(UUID cycleId);

    boolean existsByCycleIdAndUserId(UUID cycleId, UUID userId);

    void deleteByCycleIdAndUserId(UUID cycleId, UUID userId);
}
