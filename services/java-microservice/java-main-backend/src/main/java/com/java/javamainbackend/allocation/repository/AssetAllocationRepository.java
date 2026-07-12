package com.java.javamainbackend.allocation.repository;

import com.java.javamainbackend.allocation.entity.AssetAllocation;
import com.java.javamainbackend.allocation.entity.enums.AllocationStatus;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AssetAllocationRepository
        extends JpaRepository<AssetAllocation, UUID>, JpaSpecificationExecutor<AssetAllocation> {

    Optional<AssetAllocation> findByIdAndOrganizationId(UUID id, UUID organizationId);

    Optional<AssetAllocation> findByAssetIdAndStatus(UUID assetId, AllocationStatus status);

    long countByOrganizationIdAndStatus(UUID organizationId, AllocationStatus status);

    long countByOrganizationIdAndStatusAndExpectedReturnDateBefore(
            UUID organizationId, AllocationStatus status, LocalDate date);

    long countByOrganizationIdAndStatusAndExpectedReturnDate(
            UUID organizationId, AllocationStatus status, LocalDate date);
}
