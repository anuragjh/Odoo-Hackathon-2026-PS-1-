package com.java.javamainbackend.audit.controller;

import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PageableFactory;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.audit.dto.AssignAuditorRequest;
import com.java.javamainbackend.audit.dto.AuditCycleResponse;
import com.java.javamainbackend.audit.dto.AuditItemResponse;
import com.java.javamainbackend.audit.dto.CreateAuditCycleRequest;
import com.java.javamainbackend.audit.dto.MarkAuditItemRequest;
import com.java.javamainbackend.audit.service.AuditService;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/audit-cycles")
public class AuditController {

    private static final Set<String> SORTABLE = Set.of("createdAt");
    private static final String READ_ROLES = "hasAnyRole('ADMIN','ASSET_MANAGER','DEPARTMENT_HEAD')";

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuditCycleResponse>> create(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody CreateAuditCycleRequest request) {
        AuditCycleResponse response = auditService.createCycle(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Audit cycle created", response));
    }

    @GetMapping
    @PreAuthorize(READ_ROLES)
    public ApiResponse<PageResponse<AuditCycleResponse>> list(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        Pageable pageable = PageableFactory.of(page, size, "createdAt", "desc", SORTABLE, "createdAt");
        Page<AuditCycleResponse> result = auditService.listCycles(principal, pageable);
        return ApiResponse.ok(PageResponse.from(result));
    }

    @GetMapping("/{id}")
    @PreAuthorize(READ_ROLES)
    public ApiResponse<AuditCycleResponse> get(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok(auditService.getCycle(principal, id));
    }

    @PostMapping("/{id}/auditors")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AuditCycleResponse> assignAuditor(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody AssignAuditorRequest request) {
        return ApiResponse.ok("Auditor assigned", auditService.assignAuditor(principal, id, request.userId()));
    }

    @DeleteMapping("/{id}/auditors/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AuditCycleResponse> removeAuditor(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @PathVariable UUID userId) {
        return ApiResponse.ok("Auditor removed", auditService.removeAuditor(principal, id, userId));
    }

    @GetMapping("/{id}/items")
    @PreAuthorize(READ_ROLES)
    public ApiResponse<List<AuditItemResponse>> items(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok(auditService.listItems(principal, id));
    }

    @PatchMapping("/{id}/items/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<AuditItemResponse> markItem(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id,
            @PathVariable UUID itemId,
            @Valid @RequestBody MarkAuditItemRequest request) {
        return ApiResponse.ok("Item marked", auditService.markItem(principal, id, itemId, request));
    }

    @GetMapping("/{id}/discrepancies")
    @PreAuthorize(READ_ROLES)
    public ApiResponse<List<AuditItemResponse>> discrepancies(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok(auditService.discrepancies(principal, id));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<AuditCycleResponse> close(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Audit cycle closed", auditService.closeCycle(principal, id));
    }
}
