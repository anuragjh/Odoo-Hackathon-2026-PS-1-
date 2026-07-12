package com.java.javamainbackend.admin.organisationsetup.dto.department;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record UpdateDepartmentRequest(
        @NotBlank(message = "Department name is required")
        @Size(max = 150, message = "Department name must be at most 150 characters")
        String departmentName,

        @Size(max = 20, message = "Department code must be at most 20 characters")
        String departmentCode,

        String description,

        UUID parentDepartmentId,

        UUID departmentHeadId) {
}
