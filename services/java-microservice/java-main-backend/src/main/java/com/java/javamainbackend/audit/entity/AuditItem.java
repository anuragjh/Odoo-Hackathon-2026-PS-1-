package com.java.javamainbackend.audit.entity;

import com.java.javamainbackend.audit.entity.enums.AuditResult;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

@Getter
@Setter
@Entity
@Table(name = "audit_items")
public class AuditItem {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "cycle_id", nullable = false, updatable = false)
    private UUID cycleId;

    @Column(name = "asset_id", nullable = false, updatable = false)
    private UUID assetId;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "result", columnDefinition = "audit_result", nullable = false)
    private AuditResult result;

    @Column(name = "notes")
    private String notes;

    @Column(name = "audited_by")
    private UUID auditedBy;

    @Column(name = "audited_at")
    private Instant auditedAt;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
