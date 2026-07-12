package com.java.javamainbackend.admin.organisationsetup.dto.organization;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateOrganizationRequest(
        @Size(max = 200, message = "Organization name must be at most 200 characters")
        String organizationName,

        @Size(max = 250, message = "Legal name must be at most 250 characters")
        String legalName,

        String description,

        String logoUrl,

        @Size(max = 255, message = "Website must be at most 255 characters")
        String website,

        @Email(message = "A valid email is required")
        @Size(max = 255, message = "Email must be at most 255 characters")
        String email,

        @Size(max = 25, message = "Phone must be at most 25 characters")
        String phone,

        @Size(max = 255) String addressLine1,
        @Size(max = 255) String addressLine2,
        @Size(max = 100) String city,
        @Size(max = 100) String state,
        @Size(max = 20) String postalCode,
        @Size(max = 100) String country,

        @Size(max = 100) String timezone,
        @Size(max = 10) String currency,
        @Size(max = 30) String dateFormat) {
}
