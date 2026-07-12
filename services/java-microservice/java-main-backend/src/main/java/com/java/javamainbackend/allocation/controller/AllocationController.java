package com.java.javamainbackend.allocation.controller;

import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageableFactory;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.allocation.dto.AllocateAssetRequest;
import com.java.javamainbackend.allocation.dto.AllocationDashboardResponse;
import com.java.javamainbackend.allocation.dto.AllocationResponse;
import com.java.javamainbackend.allocation.dto.ReturnAssetRequest;
import com.java.javamainbackend.allocation.service.AllocationService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/allocations")
public class AllocationController {

    private static final Set<String> SORTABLE = Set.of("allocatedDate", "expectedReturnDate", "createdAt");
    private static final String READ_ROLES = "hasAnyRole('ADMIN','ASSET_MANAGER','DEPARTMENT_HEAD','EMPLOYEE')";
    private static final String WRITE_ROLES = "hasAnyRole('ADMIN','ASSET_MANAGER')";

    private final AllocationService allocationService;

    public AllocationController(AllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @PostMapping
    @PreAuthorize(WRITE_ROLES)
    public ResponseEntity<ApiResponse<AllocationResponse>> allocate(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody AllocateAssetRequest request) {
        AllocationResponse response = allocationService.allocate(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Asset allocated", response));
    }

    @GetMapping
    @PreAuthorize(READ_ROLES)
    public ApiResponse<PageResponse<AllocationResponse>> list(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID assetId,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {

        Pageable pageable = PageableFactory.of(page, size, sortBy, direction, SORTABLE, "allocatedDate");
        Page<AllocationResponse> result =
                allocationService.list(principal, search, status, assetId, userId, departmentId, pageable);
        return ApiResponse.ok(PageResponse.from(result));
    }

    @GetMapping("/dashboard")
    @PreAuthorize(READ_ROLES)
    public ApiResponse<AllocationDashboardResponse> dashboard(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(allocationService.dashboard(principal));
    }

    @GetMapping("/{id}")
    @PreAuthorize(READ_ROLES)
    public ApiResponse<AllocationResponse> get(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok(allocationService.getAllocation(principal, id));
    }

    @PostMapping("/{id}/return")
    @PreAuthorize(WRITE_ROLES)
    public ApiResponse<AllocationResponse> returnAsset(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody ReturnAssetRequest request) {
        return ApiResponse.ok("Asset returned", allocationService.returnAsset(principal, id, request));
    }
}
