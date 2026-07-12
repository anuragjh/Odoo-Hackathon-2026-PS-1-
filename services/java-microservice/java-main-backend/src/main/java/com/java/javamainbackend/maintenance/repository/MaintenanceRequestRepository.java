package com.java.javamainbackend.maintenance.repository;

import com.java.javamainbackend.maintenance.entity.MaintenanceRequest;
import com.java.javamainbackend.maintenance.entity.enums.MaintenanceStatus;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface MaintenanceRequestRepository
        extends JpaRepository<MaintenanceRequest, UUID>, JpaSpecificationExecutor<MaintenanceRequest> {

    Optional<MaintenanceRequest> findByIdAndOrganizationId(UUID id, UUID organizationId);

    long countByOrganizationIdAndStatus(UUID organizationId, MaintenanceStatus status);

    long countByOrganizationIdAndCreatedAtGreaterThanEqual(UUID organizationId, Instant since);
}
