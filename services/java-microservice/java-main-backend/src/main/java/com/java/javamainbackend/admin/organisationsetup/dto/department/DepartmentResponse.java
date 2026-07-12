package com.java.javamainbackend.admin.organisationsetup.dto.department;

import java.time.Instant;
import java.util.UUID;

public record DepartmentResponse(
        UUID id,
        String departmentName,
        String departmentCode,
        String description,
        UUID parentDepartmentId,
        String parentDepartmentName,
        UUID departmentHeadId,
        String departmentHeadName,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {
}
