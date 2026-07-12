package com.java.javamainbackend.admin.organisationsetup.controller;

import com.java.javamainbackend.admin.organisationsetup.service.AssetCategoryService;

import com.java.javamainbackend.admin.organisationsetup.dto.category.CategoryResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.category.CreateCategoryRequest;
import com.java.javamainbackend.admin.organisationsetup.dto.category.UpdateCategoryRequest;
import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageableFactory;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/asset-categories")
public class AssetCategoryController {

    private static final Set<String> SORTABLE = Set.of("categoryName", "createdAt", "updatedAt");

    private final AssetCategoryService categoryService;

    public AssetCategoryController(AssetCategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD')")
    public ApiResponse<PageResponse<CategoryResponse>> list(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {

        Pageable pageable = PageableFactory.of(page, size, sortBy, direction, SORTABLE, "categoryName");
        Page<CategoryResponse> result = categoryService.list(principal, search, active, pageable);
        return ApiResponse.ok(PageResponse.from(result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD')")
    public ApiResponse<CategoryResponse> get(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok(categoryService.getDetail(principal, id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody CreateCategoryRequest request) {
        CategoryResponse response = categoryService.create(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Category created", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CategoryResponse> update(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        return ApiResponse.ok("Category updated", categoryService.update(principal, id, request));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CategoryResponse> activate(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Category activated", categoryService.activate(principal, id));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<CategoryResponse> deactivate(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Category deactivated", categoryService.deactivate(principal, id));
    }
}
