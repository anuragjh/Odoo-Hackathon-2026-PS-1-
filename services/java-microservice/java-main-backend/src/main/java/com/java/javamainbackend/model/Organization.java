package com.java.javamainbackend.model;

import com.java.javamainbackend.util.Times;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Maps the "organizations" table from doc/schema.sql.
 */
@Entity
@Table(name = "organizations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Organization {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    // ---------- Basic information ----------

    @Column(name = "organization_name", nullable = false, length = 200)
    private String organizationName;

    @Column(name = "organization_code", nullable = false, unique = true, length = 30)
    private String organizationCode;

    @Column(name = "legal_name", length = 250)
    private String legalName;

    @Column(name = "description")
    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "website", length = 255)
    private String website;

    // ---------- Contact ----------

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "phone", length = 25)
    private String phone;

    // ---------- Address ----------

    @Column(name = "address_line1", length = 255)
    private String addressLine1;

    @Column(name = "address_line2", length = 255)
    private String addressLine2;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "country", length = 100)
    private String country;

    // ---------- Time & locale ----------

    @Column(name = "timezone", length = 100)
    private String timezone;

    @Column(name = "currency", length = 10)
    private String currency;

    @Column(name = "date_format", length = 30)
    private String dateFormat;

    // ---------- Subscription ----------

    @Column(name = "subscription_plan", length = 50)
    private String subscriptionPlan;

    @Column(name = "subscription_start")
    private LocalDateTime subscriptionStart;

    @Column(name = "subscription_end")
    private LocalDateTime subscriptionEnd;

    @Column(name = "max_users")
    private Integer maxUsers;

    @Column(name = "max_assets")
    private Integer maxAssets;

    // ---------- Status ----------

    @Column(name = "is_active")
    private Boolean active;

    @Column(name = "is_verified")
    private Boolean verified;

    @Column(name = "is_deleted")
    private Boolean deleted;


    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @PrePersist
    void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        LocalDateTime now = Times.nowUtc();
        createdAt = now;
        updatedAt = now;
        if (timezone == null) timezone = "Asia/Kolkata";
        if (currency == null) currency = "INR";
        if (dateFormat == null) dateFormat = "DD-MM-YYYY";
        if (subscriptionPlan == null) subscriptionPlan = "FREE";
        if (maxUsers == null) maxUsers = 10;
        if (maxAssets == null) maxAssets = 500;
        if (active == null) active = Boolean.TRUE;
        if (verified == null) verified = Boolean.FALSE;
        if (deleted == null) deleted = Boolean.FALSE;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Times.nowUtc();
    }
}
