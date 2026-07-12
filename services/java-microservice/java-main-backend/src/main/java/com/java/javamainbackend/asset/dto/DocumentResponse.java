package com.java.javamainbackend.asset.dto;

import java.time.Instant;
import java.util.UUID;

public record DocumentResponse(
        UUID id,
        UUID assetId,
        String documentName,
        String documentUrl,
        String documentType,
        UUID uploadedBy,
        Instant createdAt) {
}
