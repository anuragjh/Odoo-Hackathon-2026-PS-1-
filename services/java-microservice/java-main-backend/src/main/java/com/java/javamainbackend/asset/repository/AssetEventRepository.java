package com.java.javamainbackend.asset.repository;

import com.java.javamainbackend.asset.entity.AssetEvent;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetEventRepository extends JpaRepository<AssetEvent, UUID> {

    List<AssetEvent> findByAssetIdOrderByCreatedAtDesc(UUID assetId);
}
