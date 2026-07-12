package com.java.javamainbackend.booking.repository;

import com.java.javamainbackend.booking.entity.Booking;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface BookingRepository
        extends JpaRepository<Booking, UUID>, JpaSpecificationExecutor<Booking> {

    Optional<Booking> findByIdAndOrganizationId(UUID id, UUID organizationId);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.resourceId = ?1 AND b.status <> "
            + "com.java.javamainbackend.booking.entity.enums.BookingStatus.CANCELLED "
            + "AND b.startTime < ?3 AND b.endTime > ?2 AND (?4 IS NULL OR b.id <> ?4)")
    boolean overlaps(UUID resourceId, Instant start, Instant end, UUID excludeId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.organizationId = ?1 AND b.status <> "
            + "com.java.javamainbackend.booking.entity.enums.BookingStatus.CANCELLED AND b.endTime >= ?2")
    long countActive(UUID organizationId, Instant now);
}
