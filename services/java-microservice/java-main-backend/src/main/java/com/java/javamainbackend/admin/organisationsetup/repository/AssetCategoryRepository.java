package com.java.javamainbackend.admin.organisationsetup.repository;

import com.java.javamainbackend.admin.organisationsetup.entity.AssetCategory;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AssetCategoryRepository
        extends JpaRepository<AssetCategory, UUID>, JpaSpecificationExecutor<AssetCategory> {

    Optional<AssetCategory> findByIdAndOrganizationId(UUID id, UUID organizationId);

    boolean existsByOrganizationIdAndCategoryNameIgnoreCase(UUID organizationId, String categoryName);

    boolean existsByOrganizationIdAndCategoryNameIgnoreCaseAndIdNot(
            UUID organizationId, String categoryName, UUID id);

    boolean existsByOrganizationIdAndCategoryCodeIgnoreCase(UUID organizationId, String categoryCode);

    boolean existsByOrganizationIdAndCategoryCodeIgnoreCaseAndIdNot(
            UUID organizationId, String categoryCode, UUID id);

    long countByOrganizationId(UUID organizationId);
}
