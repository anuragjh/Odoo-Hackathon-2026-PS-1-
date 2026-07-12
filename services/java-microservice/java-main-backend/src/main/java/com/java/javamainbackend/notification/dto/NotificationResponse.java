package com.java.javamainbackend.notification.dto;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String type,
        String title,
        String message,
        String entityType,
        UUID entityId,
        boolean read,
        Instant createdAt) {
}
