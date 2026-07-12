package com.java.javamainbackend.admin.organisationsetup.controller;

import com.java.javamainbackend.admin.organisationsetup.service.OrganizationService;

import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.organization.OrganizationResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.organization.UpdateOrganizationRequest;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/organization")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD')")
    public ApiResponse<OrganizationResponse> get(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(organizationService.get(principal));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<OrganizationResponse> update(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody UpdateOrganizationRequest request) {
        return ApiResponse.ok("Organization updated", organizationService.update(principal, request));
    }
}
