package com.java.javamainbackend.asset.dto;

import com.java.javamainbackend.asset.entity.enums.AssetStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAssetStatusRequest(
        @NotNull(message = "status is required")
        AssetStatus status,

        String note) {
}
