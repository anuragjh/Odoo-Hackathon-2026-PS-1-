package com.java.javamainbackend.allocation.dto;

import com.java.javamainbackend.allocation.entity.enums.AllocationStatus;
import com.java.javamainbackend.asset.entity.enums.AssetCondition;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AllocationResponse(
        UUID id,
        UUID assetId,
        String assetTag,
        String assetName,
        String allocationType,
        UUID allocatedToUserId,
        String allocatedToName,
        UUID allocatedDepartmentId,
        String departmentName,
        Instant allocatedDate,
        LocalDate expectedReturnDate,
        Instant actualReturnDate,
        AllocationStatus status,
        boolean overdue,
        String notes,
        String returnNotes,
        AssetCondition returnCondition,
        Instant createdAt) {
}
