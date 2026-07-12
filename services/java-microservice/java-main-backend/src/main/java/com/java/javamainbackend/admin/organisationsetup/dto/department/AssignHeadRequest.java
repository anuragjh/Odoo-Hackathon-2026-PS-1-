package com.java.javamainbackend.admin.organisationsetup.dto.department;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AssignHeadRequest(
        @NotNull(message = "userId is required")
        UUID userId) {
}
