package com.java.javamainbackend.audit.dto;

import com.java.javamainbackend.audit.entity.enums.AuditResult;
import jakarta.validation.constraints.NotNull;

public record MarkAuditItemRequest(
        @NotNull(message = "result is required")
        AuditResult result,

        String notes) {
}
