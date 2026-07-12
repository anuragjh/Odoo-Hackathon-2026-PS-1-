package com.java.javamainbackend.maintenance.dto;

import com.java.javamainbackend.maintenance.entity.enums.MaintenancePriority;
import com.java.javamainbackend.maintenance.entity.enums.MaintenanceStatus;
import java.time.Instant;
import java.util.UUID;

public record MaintenanceResponse(
        UUID id,
        UUID assetId,
        String assetTag,
        String assetName,
        UUID raisedBy,
        String raisedByName,
        String issueDescription,
        MaintenancePriority priority,
        String photoUrl,
        MaintenanceStatus status,
        UUID technicianId,
        String technicianName,
        UUID approvedBy,
        String rejectionReason,
        String resolutionNotes,
        Instant resolvedAt,
        Instant createdAt) {
}
