package com.java.javamainbackend.audit.repository;

import com.java.javamainbackend.audit.entity.AuditItem;
import com.java.javamainbackend.audit.entity.enums.AuditResult;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditItemRepository extends JpaRepository<AuditItem, UUID> {

    List<AuditItem> findByCycleId(UUID cycleId);

    Optional<AuditItem> findByIdAndCycleId(UUID id, UUID cycleId);

    List<AuditItem> findByCycleIdAndResultIn(UUID cycleId, Collection<AuditResult> results);

    long countByCycleId(UUID cycleId);

    long countByCycleIdAndResult(UUID cycleId, AuditResult result);
}
