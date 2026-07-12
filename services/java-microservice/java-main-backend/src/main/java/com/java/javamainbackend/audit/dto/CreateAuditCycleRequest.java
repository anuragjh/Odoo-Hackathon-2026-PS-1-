package com.java.javamainbackend.audit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.UUID;

public record CreateAuditCycleRequest(
        @NotBlank(message = "Audit cycle name is required")
        @Size(max = 200) String name,

        UUID scopeDepartmentId,

        @Size(max = 255) String scopeLocation,

        LocalDate startDate,

        LocalDate endDate) {
}
