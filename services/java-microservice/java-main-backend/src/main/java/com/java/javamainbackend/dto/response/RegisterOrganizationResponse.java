package com.java.javamainbackend.dto.response;

public record RegisterOrganizationResponse(
        OrganizationResponse organization,
        UserResponse admin
) {
}
