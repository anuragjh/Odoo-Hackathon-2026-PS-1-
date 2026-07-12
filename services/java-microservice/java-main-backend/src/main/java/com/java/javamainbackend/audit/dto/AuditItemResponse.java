package com.java.javamainbackend.audit.dto;

import com.java.javamainbackend.audit.entity.enums.AuditResult;
import java.time.Instant;
import java.util.UUID;

public record AuditItemResponse(
        UUID id,
        UUID assetId,
        String assetTag,
        String assetName,
        AuditResult result,
        String notes,
        UUID auditedBy,
        Instant auditedAt) {
}
