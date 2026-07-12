package com.java.javamainbackend.dto.response;

import com.java.javamainbackend.model.Organization;

import java.time.LocalDateTime;
import java.util.UUID;

public record OrganizationResponse(
        UUID id,
        String organizationName,
        String organizationCode,
        String legalName,
        String email,
        String phone,
        String website,
        String timezone,
        String currency,
        String dateFormat,
        String subscriptionPlan,
        Integer maxUsers,
        Integer maxAssets,
        Boolean active,
        Boolean verified,
        LocalDateTime createdAt
) {

    public static OrganizationResponse from(Organization organization) {
        return new OrganizationResponse(
                organization.getId(),
                organization.getOrganizationName(),
                organization.getOrganizationCode(),
                organization.getLegalName(),
                organization.getEmail(),
                organization.getPhone(),
                organization.getWebsite(),
                organization.getTimezone(),
                organization.getCurrency(),
                organization.getDateFormat(),
                organization.getSubscriptionPlan(),
                organization.getMaxUsers(),
                organization.getMaxAssets(),
                organization.getActive(),
                organization.getVerified(),
                organization.getCreatedAt()
        );
    }
}
