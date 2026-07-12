package com.java.javamainbackend.admin.organisationsetup.controller;

import com.java.javamainbackend.admin.organisationsetup.service.DashboardService;

import com.java.javamainbackend.admin.organisationsetup.common.ApiResponse;
import com.java.javamainbackend.admin.organisationsetup.dto.dashboard.OrgSetupDashboardResponse;
import com.java.javamainbackend.admin.organisationsetup.security.AuthPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/organization-setup")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<OrgSetupDashboardResponse> orgSetupSummary(@AuthenticationPrincipal AuthPrincipal principal) {
        return ApiResponse.ok(dashboardService.orgSetupSummary(principal));
    }
}
