package com.java.javamainbackend.allocation.controller;

import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.allocation.dto.CreateTransferRequest;
import com.java.javamainbackend.allocation.dto.TransferResponse;
import com.java.javamainbackend.allocation.service.AllocationService;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/transfers")
public class TransferController {

    private static final String REQUEST_ROLES = "hasAnyRole('ADMIN','ASSET_MANAGER','DEPARTMENT_HEAD','EMPLOYEE')";
    private static final String APPROVE_ROLES = "hasAnyRole('ADMIN','ASSET_MANAGER','DEPARTMENT_HEAD')";

    private final AllocationService allocationService;

    public TransferController(AllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @PostMapping
    @PreAuthorize(REQUEST_ROLES)
    public ResponseEntity<ApiResponse<TransferResponse>> create(
            @AuthenticationPrincipal AuthPrincipal principal,
            @Valid @RequestBody CreateTransferRequest request) {
        TransferResponse response = allocationService.createTransfer(principal, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Transfer request created", response));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize(APPROVE_ROLES)
    public ApiResponse<TransferResponse> approve(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Transfer approved", allocationService.approveTransfer(principal, id));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize(APPROVE_ROLES)
    public ApiResponse<TransferResponse> reject(
            @AuthenticationPrincipal AuthPrincipal principal,
            @PathVariable UUID id) {
        return ApiResponse.ok("Transfer rejected", allocationService.rejectTransfer(principal, id));
    }
}
