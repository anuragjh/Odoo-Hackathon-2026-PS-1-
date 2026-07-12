package com.java.javamainbackend.asset.repository;

import com.java.javamainbackend.asset.entity.AssetDocument;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetDocumentRepository extends JpaRepository<AssetDocument, UUID> {

    List<AssetDocument> findByAssetIdOrderByCreatedAtDesc(UUID assetId);
}
