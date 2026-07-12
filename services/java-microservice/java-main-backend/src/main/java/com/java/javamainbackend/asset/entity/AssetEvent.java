package com.java.javamainbackend.asset.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "asset_events")
public class AssetEvent {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "asset_id", nullable = false, updatable = false)
    private UUID assetId;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "details")
    private String details;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
