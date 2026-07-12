package com.java.javamainbackend.audit.dto;

import com.java.javamainbackend.audit.entity.enums.AuditCycleStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record AuditCycleResponse(
        UUID id,
        String name,
        UUID scopeDepartmentId,
        String scopeDepartmentName,
        String scopeLocation,
        LocalDate startDate,
        LocalDate endDate,
        AuditCycleStatus status,
        long totalItems,
        long verified,
        long missing,
        long damaged,
        long pending,
        List<AuditorResponse> auditors,
        Instant closedAt,
        Instant createdAt) {
}
