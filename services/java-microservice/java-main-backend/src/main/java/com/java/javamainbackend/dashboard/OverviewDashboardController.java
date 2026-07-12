package com.java.javamainbackend.dashboard;

import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import com.java.javamainbackend.admin.organisationsetup.common.PrincipalUtils;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.allocation.entity.enums.AllocationStatus;
import com.java.javamainbackend.allocation.entity.enums.TransferStatus;
import com.java.javamainbackend.allocation.repository.AssetAllocationRepository;
import com.java.javamainbackend.allocation.repository.TransferRequestRepository;
import com.java.javamainbackend.asset.entity.enums.AssetStatus;
import com.java.javamainbackend.asset.repository.AssetRepository;
import com.java.javamainbackend.booking.repository.BookingRepository;
import com.java.javamainbackend.maintenance.repository.MaintenanceRequestRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class OverviewDashboardController {

    private final AssetRepository assetRepository;
    private final AssetAllocationRepository allocationRepository;
    private final TransferRequestRepository transferRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRequestRepository maintenanceRepository;

    public OverviewDashboardController(
            AssetRepository assetRepository,
            AssetAllocationRepository allocationRepository,
            TransferRequestRepository transferRepository,
            BookingRepository bookingRepository,
            MaintenanceRequestRepository maintenanceRepository) {
        this.assetRepository = assetRepository;
        this.allocationRepository = allocationRepository;
        this.transferRepository = transferRepository;
        this.bookingRepository = bookingRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    @GetMapping("/overview")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<KpiResponse> overview(@AuthenticationPrincipal AuthPrincipal principal) {
        UUID org = PrincipalUtils.requireOrganization(principal);
        LocalDate today = LocalDate.now();
        Instant now = Instant.now();
        Instant startOfToday = today.atStartOfDay().toInstant(ZoneOffset.UTC);

        KpiResponse response = new KpiResponse(
                assetRepository.countByOrganizationId(org),
                assetRepository.countByOrganizationIdAndStatus(org, AssetStatus.AVAILABLE),
                assetRepository.countByOrganizationIdAndStatus(org, AssetStatus.ALLOCATED),
                assetRepository.countByOrganizationIdAndStatus(org, AssetStatus.RESERVED),
                assetRepository.countByOrganizationIdAndStatus(org, AssetStatus.UNDER_MAINTENANCE),
                maintenanceRepository.countByOrganizationIdAndCreatedAtGreaterThanEqual(org, startOfToday),
                bookingRepository.countActive(org, now),
                transferRepository.countByOrganizationIdAndStatus(org, TransferStatus.PENDING),
                allocationRepository.countByOrganizationIdAndStatusAndExpectedReturnDateGreaterThanEqual(
                        org, AllocationStatus.ACTIVE, today),
                allocationRepository.countByOrganizationIdAndStatusAndExpectedReturnDate(
                        org, AllocationStatus.ACTIVE, today),
                allocationRepository.countByOrganizationIdAndStatusAndExpectedReturnDateBefore(
                        org, AllocationStatus.ACTIVE, today));

        return ApiResponse.ok(response);
    }
}
