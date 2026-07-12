package com.java.javamainbackend.reports.controller;

import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import com.java.javamainbackend.reports.dto.HeatCell;
import com.java.javamainbackend.reports.dto.ReportCount;
import com.java.javamainbackend.reports.service.ReportsService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/reports")
@PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER','DEPARTMENT_HEAD')")
public class ReportsController {

    private final ReportsService reportsService;

    public ReportsController(ReportsService reportsService) {
        this.reportsService = reportsService;
    }

    @GetMapping("/assets-by-status")
    public ApiResponse<List<ReportCount>> assetsByStatus(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(reportsService.assetsByStatus(principal));
    }

    @GetMapping("/assets-by-category")
    public ApiResponse<List<ReportCount>> assetsByCategory(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(reportsService.assetsByCategory(principal));
    }

    @GetMapping("/most-used-assets")
    public ApiResponse<List<ReportCount>> mostUsedAssets(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(reportsService.mostUsedAssets(principal));
    }

    @GetMapping("/idle-assets")
    public ApiResponse<List<ReportCount>> idleAssets(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(reportsService.idleAssets(principal));
    }

    @GetMapping("/maintenance-by-category")
    public ApiResponse<List<ReportCount>> maintenanceByCategory(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(reportsService.maintenanceByCategory(principal));
    }

    @GetMapping("/department-allocation")
    public ApiResponse<List<ReportCount>> departmentAllocation(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(reportsService.departmentAllocation(principal));
    }

    @GetMapping("/warranty-expiring")
    public ApiResponse<List<ReportCount>> warrantyExpiring(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(reportsService.warrantyExpiring(principal));
    }

    @GetMapping("/booking-heatmap")
    public ApiResponse<List<HeatCell>> bookingHeatmap(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(reportsService.bookingHeatmap(principal));
    }
}
