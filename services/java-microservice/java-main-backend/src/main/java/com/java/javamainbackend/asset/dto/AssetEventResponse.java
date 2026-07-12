package com.java.javamainbackend.asset.dto;

import java.time.Instant;
import java.util.UUID;

public record AssetEventResponse(
        UUID id,
        String eventType,
        String details,
        UUID actorId,
        Instant createdAt) {
}
