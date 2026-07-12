package com.java.javamainbackend.allocation.dto;

import com.java.javamainbackend.allocation.entity.enums.TransferStatus;
import java.time.Instant;
import java.util.UUID;

public record TransferResponse(
        UUID id,
        UUID assetId,
        String assetTag,
        String assetName,
        UUID fromUserId,
        String fromUserName,
        UUID toUserId,
        String toUserName,
        UUID toDepartmentId,
        String toDepartmentName,
        String reason,
        TransferStatus status,
        UUID approvedBy,
        Instant approvedAt,
        Instant createdAt) {
}
