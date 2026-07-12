package com.java.javamainbackend.admin.organisationsetup.controller;

import com.java.javamainbackend.admin.organisationsetup.service.EmployeeService;

import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageableFactory;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.AccountStatus;
import com.java.javamainbackend.admin.organisationsetup.entity.enums.Role;
import com.java.javamainbackend.admin.organisationsetup.dto.employee.AssignDepartmentRequest;
import com.java.javamainbackend.admin.organisationsetup.dto.employee.ChangeRoleRequest;
import com.java.javamainbackend.admin.organisationsetup.dto.employee.EmployeeDetailResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.employee.EmployeeResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.employee.EmployeeStatisticsResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.employee.UpdateEmployeeRequest;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import jakarta.validation.Valid;
import java.util.Set;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/employees")
public class EmployeeController {

    private static final Set<String> SORTABLE = Set.of("fullName", "joiningDate", "createdAt");

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD')")
    public ApiResponse<PageResponse<EmployeeResponse>> list(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) AccountStatus status,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction) {

        Pageable pageable = PageableFactory.of(page, size, sortBy, direction, SORTABLE, "fullName");
        Page<EmployeeResponse> result = employeeService.list(principal, search, role, departmentId, status, pageable);
        return ApiResponse.ok(PageResponse.from(result));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<EmployeeStatisticsResponse> statistics(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(employeeService.statistics(principal));
    }

    @GetMapping("/me")
    public ApiResponse<EmployeeDetailResponse> me(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(employeeService.getMe(principal));
    }

    @PatchMapping("/me")
    public ApiResponse<EmployeeDetailResponse> updateMe(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody UpdateEmployeeRequest request) {
        return ApiResponse.ok("Profile updated", employeeService.updateMe(principal, request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD')")
    public ApiResponse<EmployeeDetailResponse> get(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok(employeeService.getDetail(principal, id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<EmployeeDetailResponse> update(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEmployeeRequest request) {
        return ApiResponse.ok("Employee updated", employeeService.adminUpdate(principal, id, request));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<EmployeeDetailResponse> approve(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Employee approved", employeeService.approve(principal, id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<EmployeeDetailResponse> reject(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Employee rejected", employeeService.reject(principal, id));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<EmployeeDetailResponse> activate(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Employee activated", employeeService.activate(principal, id));
    }

    @PatchMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<EmployeeDetailResponse> suspend(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Employee suspended", employeeService.suspend(principal, id));
    }

    @PatchMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<EmployeeDetailResponse> unlock(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Employee unlocked", employeeService.unlock(principal, id));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<EmployeeDetailResponse> changeRole(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody ChangeRoleRequest request) {
        return ApiResponse.ok("Role updated", employeeService.changeRole(principal, id, request.role()));
    }

    @PutMapping("/{id}/department")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<EmployeeDetailResponse> assignDepartment(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody AssignDepartmentRequest request) {
        return ApiResponse.ok("Department assigned", employeeService.assignDepartment(principal, id, request));
    }

    @DeleteMapping("/{id}/department")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<EmployeeDetailResponse> removeDepartment(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Department removed", employeeService.removeDepartment(principal, id));
    }
}
