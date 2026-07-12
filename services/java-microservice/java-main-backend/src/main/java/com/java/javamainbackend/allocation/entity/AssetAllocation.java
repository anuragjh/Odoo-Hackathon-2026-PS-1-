package com.java.javamainbackend.allocation.entity;

import com.java.javamainbackend.allocation.entity.enums.AllocationStatus;
import com.java.javamainbackend.asset.entity.enums.AssetCondition;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.type.PostgreSQLEnumJdbcType;

@Getter
@Setter
@Entity
@Table(name = "asset_allocations")
public class AssetAllocation {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(name = "asset_id", nullable = false, updatable = false)
    private UUID assetId;

    @Column(name = "allocated_to_user_id", updatable = false)
    private UUID allocatedToUserId;

    @Column(name = "allocated_department_id", updatable = false)
    private UUID allocatedDepartmentId;

    @Column(name = "allocated_by", updatable = false)
    private UUID allocatedBy;

    @Column(name = "allocated_date", updatable = false)
    private Instant allocatedDate;

    @Column(name = "expected_return_date")
    private LocalDate expectedReturnDate;

    @Column(name = "actual_return_date")
    private Instant actualReturnDate;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "status", columnDefinition = "allocation_status", nullable = false)
    private AllocationStatus status;

    @Column(name = "notes")
    private String notes;

    @Column(name = "return_notes")
    private String returnNotes;

    @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(name = "return_condition", columnDefinition = "asset_condition")
    private AssetCondition returnCondition;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
