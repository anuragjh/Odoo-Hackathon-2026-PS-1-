package com.java.javamainbackend.asset.dto;

import com.java.javamainbackend.asset.entity.enums.AssetCondition;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record UpdateAssetRequest(
        @Size(max = 200, message = "Asset name must be at most 200 characters")
        String assetName,

        String description,

        @Size(max = 255, message = "Location must be at most 255 characters")
        String location,

        UUID departmentId,

        @Size(max = 120) String manufacturer,

        @Size(max = 120) String model,

        @DecimalMin(value = "0.0", message = "Acquisition cost cannot be negative")
        BigDecimal acquisitionCost,

        @Size(max = 150) String vendor,

        LocalDate warrantyExpiry,

        AssetCondition condition,

        Boolean shared,

        String photoUrl) {
}
