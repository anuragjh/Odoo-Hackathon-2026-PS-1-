package com.java.javamainbackend.asset.dto;

import com.java.javamainbackend.asset.entity.enums.AssetCondition;
import com.java.javamainbackend.asset.entity.enums.AssetStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AssetDetailResponse(
        UUID id,
        String assetTag,
        String assetName,
        UUID categoryId,
        String categoryName,
        UUID departmentId,
        String departmentName,
        String location,
        String description,
        String serialNumber,
        String manufacturer,
        String model,
        LocalDate acquisitionDate,
        BigDecimal acquisitionCost,
        String vendor,
        LocalDate warrantyExpiry,
        AssetCondition condition,
        AssetStatus status,
        boolean shared,
        String photoUrl,
        Instant createdAt,
        Instant updatedAt) {
}
