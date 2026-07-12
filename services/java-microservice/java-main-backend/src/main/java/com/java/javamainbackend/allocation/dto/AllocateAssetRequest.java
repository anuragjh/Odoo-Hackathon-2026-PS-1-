package com.java.javamainbackend.allocation.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record AllocateAssetRequest(
        @NotNull(message = "assetId is required")
        UUID assetId,

        UUID allocatedToUserId,

        UUID allocatedDepartmentId,

        LocalDate expectedReturnDate,

        String notes) {
}
