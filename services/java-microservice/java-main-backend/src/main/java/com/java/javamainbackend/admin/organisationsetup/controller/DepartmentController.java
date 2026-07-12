package com.java.javamainbackend.admin.organisationsetup.controller;

import com.java.javamainbackend.admin.organisationsetup.service.DepartmentService;

import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageableFactory;
import com.java.javamainbackend.admin.organisationsetup.dto.department.AssignHeadRequest;
import com.java.javamainbackend.admin.organisationsetup.dto.department.CreateDepartmentRequest;
import com.java.javamainbackend.admin.organisationsetup.dto.department.DepartmentDetailResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.department.DepartmentResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.department.UpdateDepartmentRequest;
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
import org.springframework.web.bind.annotation.DeleteMapping;
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
@RequestMapping("/api/v1/admin/departments")
public class DepartmentController {

    private static final Set<String> SORTABLE = Set.of("departmentName", "createdAt", "updatedAt");

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD')")
    public ApiResponse<PageResponse<DepartmentResponse>> list(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {

        Pageable pageable = PageableFactory.of(page, size, sortBy, direction, SORTABLE, "departmentName");
        Page<DepartmentResponse> result = departmentService.list(principal, search, active, pageable);
        return ApiResponse.ok(PageResponse.from(result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD')")
    public ApiResponse<DepartmentDetailResponse> get(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok(departmentService.getDetail(principal, id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DepartmentResponse>> create(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody CreateDepartmentRequest request) {
        DepartmentResponse response = departmentService.create(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Department created", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DepartmentResponse> update(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDepartmentRequest request) {
        return ApiResponse.ok("Department updated", departmentService.update(principal, id, request));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DepartmentResponse> activate(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Department activated", departmentService.activate(principal, id));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DepartmentResponse> deactivate(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Department deactivated", departmentService.deactivate(principal, id));
    }

    @PutMapping("/{id}/head")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DepartmentResponse> assignHead(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody AssignHeadRequest request) {
        return ApiResponse.ok("Department head assigned", departmentService.assignHead(principal, id, request.userId()));
    }

    @DeleteMapping("/{id}/head")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<DepartmentResponse> removeHead(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Department head removed", departmentService.removeHead(principal, id));
    }
}
