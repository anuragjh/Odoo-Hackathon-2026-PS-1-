package com.java.javamainbackend.audit.dto;

import java.time.Instant;
import java.util.UUID;

public record AuditorResponse(
        UUID userId,
        String name,
        Instant assignedAt) {
}
