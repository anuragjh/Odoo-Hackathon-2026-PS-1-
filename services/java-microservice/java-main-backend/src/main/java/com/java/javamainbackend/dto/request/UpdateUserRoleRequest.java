package com.java.javamainbackend.dto.request;

import com.java.javamainbackend.model.enums.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequest(

        @NotNull(message = "Role is required")
        Role role
) {
}
