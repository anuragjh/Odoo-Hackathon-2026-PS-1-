package com.java.javamainbackend.allocation.dto;

public record AllocationDashboardResponse(
        long currentlyAllocated,
        long pendingTransfers,
        long overdueReturns,
        long dueToday,
        long availableAssets) {
}
