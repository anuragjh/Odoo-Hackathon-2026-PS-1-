package com.java.javamainbackend.admin.organisationsetup.service;

import com.java.javamainbackend.admin.organisationsetup.common.PrincipalUtils;
import com.java.javamainbackend.admin.organisationsetup.common.exception.ConflictException;
import com.java.javamainbackend.admin.organisationsetup.common.exception.NotFoundException;
import com.java.javamainbackend.admin.organisationsetup.entity.Organization;
import com.java.javamainbackend.admin.organisationsetup.dto.organization.OrganizationResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.organization.UpdateOrganizationRequest;
import com.java.javamainbackend.admin.organisationsetup.repository.OrganizationRepository;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final AuditLogService auditLogService;

    public OrganizationService(OrganizationRepository organizationRepository, AuditLogService auditLogService) {
        this.organizationRepository = organizationRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public OrganizationResponse get(AuthPrincipal principal) {
        return toResponse(load(principal));
    }

    @Transactional
    public OrganizationResponse update(AuthPrincipal principal, UpdateOrganizationRequest request) {
        Organization organization = load(principal);

        if (request.email() != null && !request.email().isBlank()) {
            String email = request.email().trim();
            if (organizationRepository.existsByEmailIgnoreCaseAndIdNot(email, organization.getId())) {
                throw new ConflictException("Another organization already uses this email");
            }
            organization.setEmail(email);
        }

        if (request.organizationName() != null && !request.organizationName().isBlank()) {
            organization.setOrganizationName(request.organizationName().trim());
        }

        applyIfPresent(request.legalName(), organization::setLegalName);
        applyIfPresent(request.description(), organization::setDescription);
        applyIfPresent(request.logoUrl(), organization::setLogoUrl);
        applyIfPresent(request.website(), organization::setWebsite);
        applyIfPresent(request.phone(), organization::setPhone);
        applyIfPresent(request.addressLine1(), organization::setAddressLine1);
        applyIfPresent(request.addressLine2(), organization::setAddressLine2);
        applyIfPresent(request.city(), organization::setCity);
        applyIfPresent(request.state(), organization::setState);
        applyIfPresent(request.postalCode(), organization::setPostalCode);
        applyIfPresent(request.country(), organization::setCountry);

        if (request.timezone() != null && !request.timezone().isBlank()) {
            organization.setTimezone(request.timezone().trim());
        }
        if (request.currency() != null && !request.currency().isBlank()) {
            organization.setCurrency(request.currency().trim());
        }
        if (request.dateFormat() != null && !request.dateFormat().isBlank()) {
            organization.setDateFormat(request.dateFormat().trim());
        }

        organization.setUpdatedBy(principal.userId());
        organizationRepository.save(organization);
        auditLogService.record(principal, "ORGANIZATION_UPDATED", "ORGANIZATION", organization.getId(), null);

        return toResponse(organization);
    }

    private Organization load(AuthPrincipal principal) {
        UUID organizationId = PrincipalUtils.requireOrganization(principal);
        return organizationRepository.findById(organizationId)
                .orElseThrow(() -> new NotFoundException("Organization not found"));
    }

    private void applyIfPresent(String value, java.util.function.Consumer<String> setter) {
        if (value != null) {
            String trimmed = value.trim();
            setter.accept(trimmed.isEmpty() ? null : trimmed);
        }
    }

    private OrganizationResponse toResponse(Organization organization) {
        return new OrganizationResponse(
                organization.getId(),
                organization.getOrganizationName(),
                organization.getOrganizationCode(),
                organization.getLegalName(),
                organization.getDescription(),
                organization.getLogoUrl(),
                organization.getWebsite(),
                organization.getEmail(),
                organization.getPhone(),
                organization.getAddressLine1(),
                organization.getAddressLine2(),
                organization.getCity(),
                organization.getState(),
                organization.getPostalCode(),
                organization.getCountry(),
                organization.getTimezone(),
                organization.getCurrency(),
                organization.getDateFormat(),
                organization.getSubscriptionPlan(),
                organization.getMaxUsers(),
                organization.getMaxAssets(),
                organization.isActive(),
                organization.isVerified(),
                organization.getCreatedAt(),
                organization.getUpdatedAt());
    }
}
