package com.java.javamainbackend.asset.repository;

import com.java.javamainbackend.asset.entity.Asset;
import com.java.javamainbackend.asset.entity.enums.AssetCondition;
import com.java.javamainbackend.asset.entity.enums.AssetStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface AssetRepository
        extends JpaRepository<Asset, UUID>, JpaSpecificationExecutor<Asset> {

    Optional<Asset> findByIdAndOrganizationId(UUID id, UUID organizationId);

    boolean existsByOrganizationIdAndSerialNumberIgnoreCase(UUID organizationId, String serialNumber);

    boolean existsByOrganizationIdAndSerialNumberIgnoreCaseAndIdNot(
            UUID organizationId, String serialNumber, UUID id);

    long countByOrganizationId(UUID organizationId);

    long countByOrganizationIdAndStatus(UUID organizationId, AssetStatus status);

    long countByOrganizationIdAndCondition(UUID organizationId, AssetCondition condition);

    long countByOrganizationIdAndWarrantyExpiryLessThanEqual(UUID organizationId, LocalDate date);

    @Query("SELECT a.categoryId AS categoryId, COUNT(a) AS count FROM Asset a "
            + "WHERE a.organizationId = ?1 GROUP BY a.categoryId")
    List<CategoryCount> countGroupedByCategory(UUID organizationId);

    @Query("SELECT a.id FROM Asset a WHERE a.organizationId = ?1 AND ("
            + "LOWER(a.assetTag) LIKE ?2 OR LOWER(a.assetName) LIKE ?2 OR LOWER(a.serialNumber) LIKE ?2)")
    List<UUID> searchIds(UUID organizationId, String pattern);

    @Query(value = "SELECT nextval('asset_tag_seq')", nativeQuery = true)
    long nextAssetTagSequence();
}
