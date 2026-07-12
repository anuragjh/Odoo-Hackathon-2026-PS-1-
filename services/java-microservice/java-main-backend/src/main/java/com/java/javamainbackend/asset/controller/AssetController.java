package com.java.javamainbackend.asset.controller;

import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageableFactory;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.asset.dto.AddDocumentRequest;
import com.java.javamainbackend.asset.dto.AssetDashboardResponse;
import com.java.javamainbackend.asset.dto.AssetDetailResponse;
import com.java.javamainbackend.asset.dto.AssetEventResponse;
import com.java.javamainbackend.asset.dto.AssetResponse;
import com.java.javamainbackend.asset.dto.AssetStatisticsResponse;
import com.java.javamainbackend.asset.dto.CreateAssetRequest;
import com.java.javamainbackend.asset.dto.DocumentResponse;
import com.java.javamainbackend.asset.dto.UpdateAssetRequest;
import com.java.javamainbackend.asset.dto.UpdateAssetStatusRequest;
import com.java.javamainbackend.asset.entity.enums.AssetCondition;
import com.java.javamainbackend.asset.entity.enums.AssetStatus;
import com.java.javamainbackend.asset.service.AssetService;
import jakarta.validation.Valid;
import java.util.List;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/assets")
public class AssetController {

    private static final Set<String> SORTABLE =
            Set.of("assetName", "assetTag", "acquisitionDate", "acquisitionCost", "createdAt");
    private static final String READ_ROLES = "hasAnyRole('ADMIN','ASSET_MANAGER','DEPARTMENT_HEAD','EMPLOYEE')";
    private static final String WRITE_ROLES = "hasAnyRole('ADMIN','ASSET_MANAGER')";

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @PostMapping
    @PreAuthorize(WRITE_ROLES)
    public ResponseEntity<ApiResponse<AssetDetailResponse>> register(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody CreateAssetRequest request) {
        AssetDetailResponse response = assetService.register(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Asset registered", response));
    }

    @GetMapping
    @PreAuthorize(READ_ROLES)
    public ApiResponse<PageResponse<AssetResponse>> list(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) AssetStatus status,
            @RequestParam(required = false) AssetCondition condition,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Boolean shared,
            @RequestParam(required = false) String manufacturer,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {

        Pageable pageable = PageableFactory.of(page, size, sortBy, direction, SORTABLE, "assetName");
        Page<AssetResponse> result = assetService.list(
                principal, search, categoryId, departmentId, status, condition, location, shared, manufacturer, pageable);
        return ApiResponse.ok(PageResponse.from(result));
    }

    @GetMapping("/dashboard")
    @PreAuthorize(READ_ROLES)
    public ApiResponse<AssetDashboardResponse> dashboard(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(assetService.dashboard(principal));
    }

    @GetMapping("/statistics")
    @PreAuthorize(READ_ROLES)
    public ApiResponse<AssetStatisticsResponse> statistics(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(assetService.statistics(principal));
    }

    @GetMapping("/{id}")
    @PreAuthorize(READ_ROLES)
    public ApiResponse<AssetDetailResponse> get(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok(assetService.getDetail(principal, id));
    }

    @PutMapping("/{id}")
    @PreAuthorize(WRITE_ROLES)
    public ApiResponse<AssetDetailResponse> update(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAssetRequest request) {
        return ApiResponse.ok("Asset updated", assetService.update(principal, id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize(WRITE_ROLES)
    public ApiResponse<AssetDetailResponse> changeStatus(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAssetStatusRequest request) {
        return ApiResponse.ok("Asset status updated", assetService.changeStatus(principal, id, request));
    }

    @PostMapping("/{id}/documents")
    @PreAuthorize(WRITE_ROLES)
    public ResponseEntity<ApiResponse<DocumentResponse>> addDocument(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody AddDocumentRequest request) {
        DocumentResponse response = assetService.addDocument(principal, id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Document added", response));
    }

    @GetMapping("/{id}/documents")
    @PreAuthorize(READ_ROLES)
    public ApiResponse<List<DocumentResponse>> documents(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok(assetService.listDocuments(principal, id));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize(READ_ROLES)
    public ApiResponse<List<AssetEventResponse>> history(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok(assetService.history(principal, id));
    }
}
