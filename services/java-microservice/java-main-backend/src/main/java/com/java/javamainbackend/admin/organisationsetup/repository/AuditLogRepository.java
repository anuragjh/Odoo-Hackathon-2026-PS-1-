package com.java.javamainbackend.admin.organisationsetup.repository;

import com.java.javamainbackend.admin.organisationsetup.entity.AuditLog;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
}
