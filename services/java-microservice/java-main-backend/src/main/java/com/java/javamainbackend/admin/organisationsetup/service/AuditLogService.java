package com.java.javamainbackend.admin.organisationsetup.service;

import com.java.javamainbackend.admin.organisationsetup.entity.AuditLog;
import com.java.javamainbackend.admin.organisationsetup.repository.AuditLogRepository;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void record(
            AuthPrincipal actor,
            String action,
            String entityType,
            UUID entityId,
            Map<String, Object> details) {

        AuditLog log = new AuditLog();
        log.setId(UUID.randomUUID());
        log.setOrganizationId(actor.organizationId());
        log.setActorId(actor.userId());
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetails(details);
        log.setCreatedAt(Instant.now());
        auditLogRepository.save(log);
    }
}
