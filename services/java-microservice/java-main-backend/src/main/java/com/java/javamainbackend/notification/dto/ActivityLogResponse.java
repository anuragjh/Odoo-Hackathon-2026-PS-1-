package com.java.javamainbackend.notification.dto;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record ActivityLogResponse(
        UUID id,
        UUID actorId,
        String action,
        String entityType,
        UUID entityId,
        Map<String, Object> details,
        Instant createdAt) {
}
