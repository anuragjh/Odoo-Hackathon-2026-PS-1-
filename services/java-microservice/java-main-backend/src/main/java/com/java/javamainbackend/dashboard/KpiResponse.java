package com.java.javamainbackend.dashboard;

public record KpiResponse(
        long totalAssets,
        long assetsAvailable,
        long assetsAllocated,
        long assetsReserved,
        long underMaintenance,
        long maintenanceToday,
        long activeBookings,
        long pendingTransfers,
        long upcomingReturns,
        long dueToday,
        long overdueReturns) {
}
