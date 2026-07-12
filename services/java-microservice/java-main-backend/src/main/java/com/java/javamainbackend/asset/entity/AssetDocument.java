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
@Table(name = "asset_documents")
public class AssetDocument {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "asset_id", nullable = false, updatable = false)
    private UUID assetId;

    @Column(name = "document_name", nullable = false)
    private String documentName;

    @Column(name = "document_url", nullable = false)
    private String documentUrl;

    @Column(name = "document_type")
    private String documentType;

    @Column(name = "uploaded_by")
    private UUID uploadedBy;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
