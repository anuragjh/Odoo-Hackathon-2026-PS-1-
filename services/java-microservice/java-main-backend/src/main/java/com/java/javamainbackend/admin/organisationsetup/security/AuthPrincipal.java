package com.java.javamainbackend.admin.organisationsetup.security;

import com.java.javamainbackend.admin.organisationsetup.entity.enums.Role;
import java.util.UUID;

public record AuthPrincipal(UUID userId, String email, Role role, UUID organizationId) {
}
