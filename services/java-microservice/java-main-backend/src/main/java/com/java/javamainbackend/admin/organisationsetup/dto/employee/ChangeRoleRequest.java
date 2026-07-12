package com.java.javamainbackend.admin.organisationsetup.dto.employee;

import com.java.javamainbackend.admin.organisationsetup.entity.enums.Role;
import jakarta.validation.constraints.NotNull;

public record ChangeRoleRequest(
        @NotNull(message = "role is required")
        Role role) {
}
