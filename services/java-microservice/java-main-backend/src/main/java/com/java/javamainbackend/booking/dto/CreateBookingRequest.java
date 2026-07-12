package com.java.javamainbackend.booking.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

public record CreateBookingRequest(
        @NotNull(message = "resourceId is required")
        UUID resourceId,

        @NotNull(message = "startTime is required")
        Instant startTime,

        @NotNull(message = "endTime is required")
        Instant endTime,

        @Size(max = 200) String purpose,

        String notes) {
}
