package com.java.javamainbackend.admin.organisationsetup.dto.employee;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AssignDepartmentRequest(
        @NotNull(message = "departmentId is required")
        UUID departmentId) {
}
