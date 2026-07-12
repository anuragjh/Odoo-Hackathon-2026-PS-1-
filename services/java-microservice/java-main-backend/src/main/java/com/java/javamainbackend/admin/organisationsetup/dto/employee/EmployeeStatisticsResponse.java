package com.java.javamainbackend.admin.organisationsetup.dto.employee;

public record EmployeeStatisticsResponse(
        long total,
        long pendingApproval,
        long active,
        long inactive,
        long suspended,
        long locked,
        long assetManagers,
        long departmentHeads,
        long employees) {
}
