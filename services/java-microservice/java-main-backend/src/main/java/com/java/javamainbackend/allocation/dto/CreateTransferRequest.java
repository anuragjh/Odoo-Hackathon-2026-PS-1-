package com.java.javamainbackend.allocation.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateTransferRequest(
        @NotNull(message = "assetId is required")
        UUID assetId,

        UUID toUserId,

        UUID toDepartmentId,

        String reason) {
}
