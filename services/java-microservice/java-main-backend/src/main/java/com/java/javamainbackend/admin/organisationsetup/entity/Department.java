package com.java.javamainbackend.admin.organisationsetup.entity;

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
@Table(name = "departments")
public class Department {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "organization_id", nullable = false, updatable = false)
    private UUID organizationId;

    @Column(name = "department_name", nullable = false)
    private String departmentName;

    @Column(name = "department_code")
    private String departmentCode;

    @Column(name = "description")
    private String description;

    @Column(name = "parent_department_id")
    private UUID parentDepartmentId;

    @Column(name = "department_head_id")
    private UUID departmentHeadId;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
