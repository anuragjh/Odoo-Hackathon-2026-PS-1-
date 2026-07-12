package com.java.javamainbackend.audit.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AssignAuditorRequest(
        @NotNull(message = "userId is required")
        UUID userId) {
}
