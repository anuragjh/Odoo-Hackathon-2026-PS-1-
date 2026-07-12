package com.java.javamainbackend.admin.organisationsetup.dto.organization;

import java.time.Instant;
import java.util.UUID;

public record OrganizationResponse(
        UUID id,
        String organizationName,
        String organizationCode,
        String legalName,
        String description,
        String logoUrl,
        String website,
        String email,
        String phone,
        String addressLine1,
        String addressLine2,
        String city,
        String state,
        String postalCode,
        String country,
        String timezone,
        String currency,
        String dateFormat,
        String subscriptionPlan,
        Integer maxUsers,
        Integer maxAssets,
        boolean active,
        boolean verified,
        Instant createdAt,
        Instant updatedAt) {
}
