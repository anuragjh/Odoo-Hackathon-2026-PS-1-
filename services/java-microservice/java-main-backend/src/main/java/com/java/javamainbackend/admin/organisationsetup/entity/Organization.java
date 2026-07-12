package com.java.javamainbackend.admin.organisationsetup.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity(name = "OrgSetupOrganization")
@Table(name = "organizations")
public class Organization {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "organization_name", nullable = false)
    private String organizationName;

    @Column(name = "organization_code", nullable = false, updatable = false)
    private String organizationCode;

    @Column(name = "legal_name")
    private String legalName;

    @Column(name = "description")
    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "website")
    private String website;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "address_line1")
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column(name = "city")
    private String city;

    @Column(name = "state")
    private String state;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "country")
    private String country;

    @Column(name = "timezone")
    private String timezone;

    @Column(name = "currency")
    private String currency;

    @Column(name = "date_format")
    private String dateFormat;

    @Column(name = "subscription_plan")
    private String subscriptionPlan;

    @Column(name = "max_users")
    private Integer maxUsers;

    @Column(name = "max_assets")
    private Integer maxAssets;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "is_verified", nullable = false)
    private boolean verified;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;
}
