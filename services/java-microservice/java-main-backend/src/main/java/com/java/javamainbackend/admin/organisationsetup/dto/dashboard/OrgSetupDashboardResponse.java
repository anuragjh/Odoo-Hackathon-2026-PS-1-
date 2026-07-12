package com.java.javamainbackend.admin.organisationsetup.dto.dashboard;

public record OrgSetupDashboardResponse(
        long departments,
        long employees,
        long assetManagers,
        long departmentHeads,
        long categories,
        long pendingApprovals) {
}
