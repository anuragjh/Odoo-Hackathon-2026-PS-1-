package com.java.javamainbackend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;


public record RegisterOrganizationRequest(

        @NotBlank(message = "Organization name is required")
        @Size(min = 2, max = 200, message = "Organization name must be 2-200 characters")
        String organizationName,

        @Size(min = 3, max = 30, message = "Organization code must be 3-30 characters")
        @Pattern(regexp = "^[A-Za-z0-9_-]+$",
                message = "Organization code may only contain letters, digits, '-' and '_'")
        String organizationCode,

        @NotBlank(message = "Organization email is required")
        @Email(message = "Organization email must be a valid email address")
        @Size(max = 255, message = "Organization email must be at most 255 characters")
        String email,

        @Pattern(regexp = "^[+0-9][0-9 ()\\-]{6,24}$",
                message = "Phone must be a valid phone number")
        String phone,

        @Size(max = 250, message = "Legal name must be at most 250 characters")
        String legalName,

        @Size(max = 2000, message = "Description must be at most 2000 characters")
        String description,

        @Size(max = 255, message = "Website must be at most 255 characters")
        String website,

        @Size(max = 255) String addressLine1,
        @Size(max = 255) String addressLine2,
        @Size(max = 100) String city,
        @Size(max = 100) String state,
        @Size(max = 20) String postalCode,
        @Size(max = 100) String country,
        @Size(max = 100) String timezone,
        @Size(max = 10) String currency,

        @NotBlank(message = "Admin name is required")
        @Size(min = 2, max = 120, message = "Admin name must be 2-120 characters")
        String adminName,

        @NotBlank(message = "Admin email is required")
        @Email(message = "Admin email must be a valid email address")
        @Size(max = 255, message = "Admin email must be at most 255 characters")
        String adminEmail,

        @NotBlank(message = "Admin password is required")
        @Size(min = 8, max = 72, message = "Password must be 8-72 characters")
        @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$",
                message = "Password must contain at least one uppercase letter, one lowercase letter, one digit and one special character")
        String adminPassword
) {
}
