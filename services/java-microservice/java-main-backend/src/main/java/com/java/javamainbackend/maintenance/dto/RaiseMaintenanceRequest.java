package com.java.javamainbackend.maintenance.dto;

import com.java.javamainbackend.maintenance.entity.enums.MaintenancePriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record RaiseMaintenanceRequest(
        @NotNull(message = "assetId is required")
        UUID assetId,

        @NotBlank(message = "issueDescription is required")
        String issueDescription,

        MaintenancePriority priority,

        String photoUrl) {
}
