package com.java.javamainbackend.booking.dto;

import com.java.javamainbackend.booking.entity.enums.BookingStatus;
import java.time.Instant;
import java.util.UUID;

public record BookingResponse(
        UUID id,
        UUID resourceId,
        String assetTag,
        String resourceName,
        UUID bookedByUserId,
        String bookedByName,
        String purpose,
        Instant startTime,
        Instant endTime,
        BookingStatus status,
        String notes,
        Instant createdAt) {
}
