package com.java.javamainbackend.allocation.repository;

import com.java.javamainbackend.allocation.entity.TransferRequest;
import com.java.javamainbackend.allocation.entity.enums.TransferStatus;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TransferRequestRepository
        extends JpaRepository<TransferRequest, UUID>, JpaSpecificationExecutor<TransferRequest> {

    Optional<TransferRequest> findByIdAndOrganizationId(UUID id, UUID organizationId);

    Optional<TransferRequest> findByAssetIdAndStatus(UUID assetId, TransferStatus status);

    long countByOrganizationIdAndStatus(UUID organizationId, TransferStatus status);
}
