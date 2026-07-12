package com.java.javamainbackend.maintenance.controller;

import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageableFactory;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.maintenance.dto.AssignTechnicianRequest;
import com.java.javamainbackend.maintenance.dto.MaintenanceDashboardResponse;
import com.java.javamainbackend.maintenance.dto.MaintenanceResponse;
import com.java.javamainbackend.maintenance.dto.RaiseMaintenanceRequest;
import com.java.javamainbackend.maintenance.dto.RejectMaintenanceRequest;
import com.java.javamainbackend.maintenance.dto.ResolveMaintenanceRequest;
import com.java.javamainbackend.maintenance.entity.enums.MaintenancePriority;
import com.java.javamainbackend.maintenance.service.MaintenanceService;
import jakarta.validation.Valid;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/maintenance")
public class MaintenanceController {

    private static final Set<String> SORTABLE = Set.of("createdAt", "priority", "status");
    private static final String WRITE_ROLES = "hasAnyRole('ADMIN','ASSET_MANAGER')";

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> raise(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody RaiseMaintenanceRequest request) {
        MaintenanceResponse response = maintenanceService.raise(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Maintenance request raised", response));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<PageResponse<MaintenanceResponse>> list(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID assetId,
            @RequestParam(required = false) MaintenancePriority priority,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {
        Pageable pageable = PageableFactory.of(page, size, sortBy, direction, SORTABLE, "createdAt");
        Page<MaintenanceResponse> result = maintenanceService.list(principal, status, assetId, priority, pageable);
        return ApiResponse.ok(PageResponse.from(result));
    }

    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<MaintenanceDashboardResponse> dashboard(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(maintenanceService.dashboard(principal));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<MaintenanceResponse> get(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok(maintenanceService.get(principal, id));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize(WRITE_ROLES)
    public ApiResponse<MaintenanceResponse> approve(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Maintenance approved", maintenanceService.approve(principal, id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize(WRITE_ROLES)
    public ApiResponse<MaintenanceResponse> reject(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @RequestBody RejectMaintenanceRequest request) {
        return ApiResponse.ok("Maintenance rejected", maintenanceService.reject(principal, id, request));
    }

    @PatchMapping("/{id}/assign-technician")
    @PreAuthorize(WRITE_ROLES)
    public ApiResponse<MaintenanceResponse> assignTechnician(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody AssignTechnicianRequest request) {
        return ApiResponse.ok("Technician assigned", maintenanceService.assignTechnician(principal, id, request));
    }

    @PatchMapping("/{id}/start")
    @PreAuthorize(WRITE_ROLES)
    public ApiResponse<MaintenanceResponse> start(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Maintenance in progress", maintenanceService.start(principal, id));
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize(WRITE_ROLES)
    public ApiResponse<MaintenanceResponse> resolve(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @RequestBody ResolveMaintenanceRequest request) {
        return ApiResponse.ok("Maintenance resolved", maintenanceService.resolve(principal, id, request));
    }
}
