package com.java.javamainbackend.admin.organisationsetup.dto.category;

import java.time.Instant;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String categoryName,
        String categoryCode,
        String description,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {
}
