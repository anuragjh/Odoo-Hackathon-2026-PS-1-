package com.java.javamainbackend.booking.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record RescheduleBookingRequest(
        @NotNull(message = "startTime is required")
        Instant startTime,

        @NotNull(message = "endTime is required")
        Instant endTime) {
}
