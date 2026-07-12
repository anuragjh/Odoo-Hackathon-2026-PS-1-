package com.java.javamainbackend.asset.dto;

import com.java.javamainbackend.asset.entity.enums.AssetCondition;
import com.java.javamainbackend.asset.entity.enums.AssetStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AssetResponse(
        UUID id,
        String assetTag,
        String assetName,
        UUID categoryId,
        String categoryName,
        UUID departmentId,
        String departmentName,
        String location,
        AssetStatus status,
        AssetCondition condition,
        boolean shared,
        LocalDate acquisitionDate,
        Instant createdAt) {
}
