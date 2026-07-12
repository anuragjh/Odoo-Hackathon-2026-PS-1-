package com.java.javamainbackend.asset.dto;

public record AssetDashboardResponse(
        long total,
        long available,
        long allocated,
        long reserved,
        long underMaintenance,
        long lost,
        long retired,
        long disposed) {
}
