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

    @Query(value = "SELECT EXISTS(SELECT 1 FROM bookings b WHERE b.resource_id = ?1 "
            + "AND b.status <> 'CANCELLED' AND b.start_time < ?3 AND b.end_time > ?2 "
            + "AND (CAST(?4 AS uuid) IS NULL OR b.id <> CAST(?4 AS uuid)))", nativeQuery = true)
    boolean overlaps(UUID resourceId, Instant start, Instant end, UUID excludeId);

    @Query(value = "SELECT COUNT(*) FROM bookings WHERE organization_id = ?1 "
            + "AND status <> 'CANCELLED' AND end_time >= ?2", nativeQuery = true)
    long countActive(UUID organizationId, Instant now);
}
